import { useQuery } from "@tanstack/react-query";
import { fetchHighValueCards, searchCards, fetchCardById, toCardData, fetchTopHoloCardsQuick } from "@/lib/pokemonTcgApi";
import type { PokemonTCGCard } from "@/lib/pokemonTcgApi";
import type { CardData } from "@/data/marketData";

const CACHE_KEY = "ppt-live-cards-cache-v3";
const QUICK_CACHE_KEY = "ppt-live-cards-quick-cache-v1";

function getCachedCards(): CardData[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    // Landing-page market data must stay fresh; never treat old values as live.
    if (Date.now() - timestamp > 30 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedCards(cards: CardData[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: cards, timestamp: Date.now() }));
  } catch {
    // Storage full — ignore
  }
}

function getQuickCachedCards(): CardData[] | null {
  try {
    const cached = localStorage.getItem(QUICK_CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > 30 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function setQuickCachedCards(cards: CardData[]) {
  try {
    localStorage.setItem(QUICK_CACHE_KEY, JSON.stringify({ data: cards, timestamp: Date.now() }));
  } catch {
    // Storage full — ignore
  }
}

/**
 * Fetch high-value cards with TCGPlayer pricing, converted to CardData[]
 * Implements stale-while-revalidate: serves cached data on API failure
 */
export function useLiveCards() {
  return useQuery({
    queryKey: ["live-cards"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s circuit breaker for deeper pull

      try {
        const apiCards = await fetchHighValueCards(5000);
        clearTimeout(timeout);
        const mapped = apiCards
          .map(toCardData)
          .filter((c): c is CardData & { _apiId: string; _image: string } => c !== null && c.market > 0)
          .sort((a, b) => b.market - a.market);
        // Persist to localStorage for offline fallback
        setCachedCards(mapped);
        return mapped;
      } catch (error) {
        clearTimeout(timeout);
        console.warn("[Circuit Breaker] API call failed or timed out, switching to cache:", error);
        // Serve stale cache when API is down (circuit breaker fallback)
        const cached = getCachedCards();
        if (cached && cached.length > 0) {
          console.warn("[SWR] Serving cached data due to API failure");
          return cached;
        }
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 min stale time
    refetchInterval: 30 * 60 * 1000, // refresh every 30 min
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1, // Only retry once before falling back to cache
    // Initialize from cache while fetching
    placeholderData: () => getCachedCards() ?? undefined,
  });
}

/**
 * Fast first-paint hook: a single 250-card holofoil page so the hero
 * has live cards to render within ~1-2s on cold loads, while the full
 * useLiveCards pull continues in the background.
 */
export function useLiveCardsQuick() {
  return useQuery({
    queryKey: ["live-cards-quick"],
    queryFn: async () => {
      const apiCards = await fetchTopHoloCardsQuick(36);
      const mapped = apiCards
        .map(toCardData)
        .filter((c): c is CardData & { _apiId: string; _image: string } => c !== null && c.market > 0)
        .sort((a, b) => b.market - a.market);

      if (mapped.length > 0) {
        setQuickCachedCards(mapped);
        return mapped;
      }

      return getQuickCachedCards() ?? [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    placeholderData: () => getQuickCachedCards() ?? undefined,
  });
}

/**
 * Search cards by name via the API
 */
export function useCardSearch(query: string) {
  return useQuery({
    queryKey: ["card-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const apiCards = await searchCards(query, 150);
      return apiCards
        .map(toCardData)
        .filter((c): c is CardData & { _apiId: string; _image: string } => c !== null)
        .sort((a, b) => (b.market || 0) - (a.market || 0));
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch a single card by its API id
 */
export function useCardDetail(apiId: string | undefined) {
  return useQuery({
    queryKey: ["card-detail", apiId],
    queryFn: async () => {
      if (!apiId) throw new Error("No card ID");
      const card = await fetchCardById(apiId);
      return card;
    },
    enabled: !!apiId,
    staleTime: 5 * 60 * 1000,
  });
}

export type { PokemonTCGCard };
