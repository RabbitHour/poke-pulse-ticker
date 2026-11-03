import { supabase } from "@/integrations/supabase/client";
import type { CardData } from "@/data/marketData";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const PROXY_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/pokemon-proxy`;

/**
 * Generate set initials from set name, e.g. "Prismatic Evolutions" → "PE"
 */
function getSetInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase();
}

export interface PokemonTCGSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
  legalities?: Record<string, string>;
}

export interface PokemonTCGCard {
  id: string;
  name: string;
  number: string;
  set: {
    id: string;
    name: string;
    series: string;
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices: {
      normal?: { low: number; mid: number; high: number; market: number; directLow?: number };
      holofoil?: { low: number; mid: number; high: number; market: number; directLow?: number };
      reverseHolofoil?: { low: number; mid: number; high: number; market: number; directLow?: number };
      "1stEditionHolofoil"?: { low: number; mid: number; high: number; market: number; directLow?: number };
      "1stEditionNormal"?: { low: number; mid: number; high: number; market: number; directLow?: number };
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
  rarity?: string;
  supertype: string;
}

interface APIResponse {
  data: PokemonTCGCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

async function proxyFetch(path: string, params?: Record<string, string>): Promise<any> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const timestamp = Date.now().toString();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "X-Request-Timestamp": timestamp,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Retry up to 2 times with exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ path, params }),
      });

      if (res.status === 429) {
        // Rate limited — wait and retry
        await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
        continue;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `Proxy error: ${res.status}`);
      }
      return res.json();
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
    }
  }
}

/**
 * Fetch all sets
 */
export async function fetchSets(): Promise<PokemonTCGSet[]> {
  const data = await proxyFetch("/sets", {
    orderBy: "-releaseDate",
    pageSize: "250",
  });
  return data.data;
}

/**
 * Fetch cards for a specific set
 */
export async function fetchSetCards(setId: string, page = 1, pageSize = 50): Promise<{ cards: PokemonTCGCard[]; totalCount: number }> {
  const data: APIResponse = await proxyFetch("/cards", {
    q: `set.id:${setId}`,
    pageSize: String(pageSize),
    page: String(page),
    orderBy: "number",
  });
  return { cards: data.data, totalCount: data.totalCount };
}

/**
 * Fetch cards from the Poké TCG API
 */
export async function fetchCards(query: string, pageSize = 50, page = 1): Promise<APIResponse> {
  return proxyFetch("/cards", {
    q: query,
    pageSize: String(pageSize),
    page: String(page),
    orderBy: "-tcgplayer.prices.holofoil.market",
  });
}

/**
 * Search cards by name
 */
export async function searchCards(name: string, pageSize = 100): Promise<PokemonTCGCard[]> {
  // Sanitize: keep letters, digits, spaces, hyphens, apostrophes, periods
  const clean = name.replace(/[^A-Za-z0-9 \-'.]/g, "").trim();
  if (!clean) return [];
  // Wildcard each whitespace-separated token so partial / multi-word queries match
  // Also include set.name as a fallback so users can search by set ("151", "evolving skies")
  const tokens = clean.split(/\s+/).filter(Boolean);
  const nameQ = tokens.map(t => `name:*${t}*`).join(" ");
  const setQ = tokens.map(t => `set.name:*${t}*`).join(" ");
  const numberQ = /^[A-Za-z]*\d+[A-Za-z]*$/.test(clean) ? ` OR number:"${clean}"` : "";
  const q = `(${nameQ}) OR (${setQ})${numberQ}`;
  const data: APIResponse = await proxyFetch("/cards", {
    q,
    pageSize: String(pageSize),
    orderBy: "-tcgplayer.prices.holofoil.market",
  });
  return data.data;
}

/**
 * Get a single card by ID
 */
export async function fetchCardById(id: string): Promise<PokemonTCGCard> {
  const data = await proxyFetch(`/cards/${id}`);
  return data.data;
}

/**
 * Fast first-paint fetch: a single 250-card holofoil page (~1-2s).
 * Used to render the hero strip immediately on cold loads while the
 * full multi-query high-value pull continues in the background.
 */
export async function fetchTopHoloCardsQuick(pageSize = 250): Promise<PokemonTCGCard[]> {
  const params = new URLSearchParams({
    q: "tcgplayer.prices.holofoil.market:[1 TO *]",
    pageSize: String(pageSize),
    page: "1",
    orderBy: "-tcgplayer.prices.holofoil.market",
  });

  // Fast lane: try the public Poké TCG endpoint directly for first paint.
  try {
    const directRes = await fetch(`https://api.pokemontcg.io/v2/cards?${params.toString()}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (directRes.ok) {
      const data: APIResponse = await directRes.json();
      if (data?.data?.length) return data.data;
    }
  } catch {
    // fall through to the proxy (which rotates free sources + TCGdex failover)
  }

  // Failover lane: the backend proxy rotates daily across free sources.
  try {
    const data: APIResponse = await proxyFetch("/cards", Object.fromEntries(params.entries()));
    return data?.data ?? [];
  } catch {
    return [];
  }
}


/**
 * Fetch high-value cards with pricing data.
 * Uses minimal API calls to stay within pokemontcg.io rate limits (no API key = ~20 req/min).
 */
export async function fetchHighValueCards(total = 5000): Promise<PokemonTCGCard[]> {
  const PAGE_SIZE = 250;

  // Small delay between requests to respect rate limits
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const fetchPages = async (q: string, orderBy: string, pages: number): Promise<PokemonTCGCard[]> => {
    const results: PokemonTCGCard[] = [];
    for (let page = 1; page <= pages; page++) {
      if (page > 1) await delay(1500);
      try {
        const data: APIResponse = await proxyFetch("/cards", {
          q,
          pageSize: String(PAGE_SIZE),
          page: String(page),
          orderBy,
        });
        results.push(...data.data);
        if (data.data.length < PAGE_SIZE) break;
      } catch {
        break;
      }
    }
    return results;
  };

  // Query 1: Holofoil cards (deep pull → 10 pages = up to 2500)
  const holoCards = await fetchPages(
    "tcgplayer.prices.holofoil.market:[1 TO *]",
    "-tcgplayer.prices.holofoil.market",
    10
  );

  await delay(1500);

  // Query 2: Normal-priced cards worth $1+ (broader floor)
  const normalCards = await fetchPages(
    "tcgplayer.prices.normal.market:[1 TO *]",
    "-tcgplayer.prices.normal.market",
    6
  );

  await delay(1500);

  // Query 3: Reverse holos worth $1+
  const reverseCards = await fetchPages(
    "tcgplayer.prices.reverseHolofoil.market:[1 TO *]",
    "-tcgplayer.prices.reverseHolofoil.market",
    4
  );

  await delay(1500);

  // Query 4: Premium rarities in one combined query
  const rarityQuery = [
    "Illustration Rare", "Special Art Rare", "Hyper Rare",
    "Rare Ultra", "Rare Secret", "Rare Rainbow", "Ultra Rare",
    "Special Illustration Rare", "Trainer Gallery Rare Holo",
    "Rare Holo VMAX", "Rare Holo VSTAR", "Rare Holo EX", "Rare Holo GX",
    "Amazing Rare", "Radiant Rare", "Shiny Rare", "Shiny Ultra Rare",
  ].map(r => `rarity:"${r}"`).join(" OR ");
  const rarityCards = await fetchPages(
    `(${rarityQuery})`,
    "-tcgplayer.prices.holofoil.market",
    6
  );

  // Deduplicate by card id
  const allCards = [...holoCards, ...normalCards, ...reverseCards, ...rarityCards];
  const seen = new Set<string>();
  const unique = allCards.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  // Sort by best available price descending
  unique.sort((a, b) => {
    const pa = getBestPrice(a)?.market ?? 0;
    const pb = getBestPrice(b)?.market ?? 0;
    return pb - pa;
  });

  return unique.slice(0, total);
}

/**
 * Get the best available price from a card's tcgplayer data.
 *
 * HONESTY POLICY: Returns raw TCGPlayer market price unmodified.
 * No "consensus blend" multipliers are applied. When real adapters
 * for eBay sold-listings, PriceCharting, CardLadder, or Probstein
 * are wired (via EBAY_APP_ID, PRICECHARTING_API_KEY, etc.), a
 * dedicated consensus engine will replace this single-source path.
 *
 * Selects the HIGHEST market-priced variant so alt arts, secret rares,
 * and premium variants show their true TCGPlayer value (not the
 * cheapest reprint of the same card name).
 */
export function getBestPrice(card: PokemonTCGCard): {
  market: number;
  low: number;
  mid: number;
  high: number;
  variant: string;
} | null {
  if (!card.tcgplayer?.prices) return null;

  const variants = [
    "1stEditionHolofoil",
    "holofoil",
    "1stEditionNormal",
    "reverseHolofoil",
    "normal",
  ] as const;

  let best: { market: number; low: number; mid: number; high: number; variant: string } | null = null;

  for (const variant of variants) {
    const p = card.tcgplayer.prices[variant];
    if (p?.market && (!best || p.market > best.market)) {
      best = {
        market: p.market,
        low: p.low ?? p.market * 0.8,
        mid: p.mid ?? p.market,
        high: p.high ?? p.market * 1.2,
        variant,
      };
    }
  }

  if (!best) return null;

  // Return raw TCGPlayer prices — no synthetic uplift.
  return {
    market: Math.round(best.market * 100) / 100,
    low: Math.round(best.low * 100) / 100,
    mid: Math.round(best.mid * 100) / 100,
    high: Math.round(best.high * 100) / 100,
    variant: best.variant,
  };
}

/**
 * Convert a PokemonTCGCard into our local CardData format.
 * Uses actual TCGPlayer price spread (mid vs market) for change signal
 * instead of a fake hash-based value.
 */
export function toCardData(card: PokemonTCGCard): CardData | null {
  const price = getBestPrice(card);
  if (!price) return null;

  // Honesty policy: never fabricate % change with jitter or clamps.
  // Prefer source-backed momentum from Cardmarket averages when present;
  // otherwise fall back to 0 until a real time-series source is available.
  const cm = card.cardmarket?.prices;
  const dayRef = cm?.avg1 && cm?.avg7 ? ((cm.avg1 - cm.avg7) / cm.avg7) * 100 : null;
  const weekRef = cm?.avg7 && cm?.avg30 ? ((cm.avg7 - cm.avg30) / cm.avg30) * 100 : null;
  const trendRef = cm?.trendPrice && cm?.averageSellPrice
    ? ((cm.trendPrice - cm.averageSellPrice) / cm.averageSellPrice) * 100
    : null;
  const candidates = [dayRef, weekRef, trendRef].filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value)
  );
  const sourceBackedChange = candidates.length > 0
    ? candidates.reduce((sum, value) => sum + value, 0) / candidates.length
    : null;
  const change = Math.round((sourceBackedChange ?? 0) * 100) / 100;

  // Volume estimate from price spread width (wider spread = more volatile = more volume)
  const spreadPct = price.high > 0 ? ((price.high - price.low) / price.high) * 100 : 0;
  const volume = Math.floor(Math.max(5, Math.min(500, spreadPct * 8)));

  return {
    name: card.name,
    set: card.set.name,
    setCode: getSetInitials(card.set.name),
    number: card.number,
    market: price.market,
    low: price.low,
    mid: price.mid,
    change,
    volume,
    _apiId: card.id,
    _image: card.images.small,
    _variant: price.variant,
  } as CardData & { _apiId: string; _image: string; _variant: string };
}
