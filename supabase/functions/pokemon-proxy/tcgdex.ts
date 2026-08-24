// Free-source failover: TCGdex (https://api.tcgdex.net) — no API key required.
// Normalizes TCGdex responses into the pokemontcg.io envelope the client expects,
// so the app keeps serving live TCGplayer/Cardmarket prices when pokemontcg.io is down.

const TCGDEX = "https://api.tcgdex.net/v2/en";

// Modern, liquid, high-value sets used to build the default "high value" pool
// when the incoming query has no set/name filter.
const HIGH_VALUE_SETS = [
  "sv08.5", "sv10", "sv09", "sv08", "sv07", "sv06.5", "sv06", "sv05",
  "sv04.5", "sv04", "sv03.5", "sv03", "sv02", "sv01", "swsh12pt5", "swsh7",
];

interface Brief { id: string; name: string; localId?: string; image?: string }

async function getJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "PokePulseTicker/1.0 (+https://poke-pulse-ticker.com)" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && isFinite(v) && v > 0 ? v : undefined;
}

/** Map a hydrated TCGdex card into the pokemontcg.io card shape. */
function mapCard(c: any): any | null {
  if (!c?.id || !c?.name) return null;

  const variants: any[] = Array.isArray(c.variants_detailed) ? c.variants_detailed : [];
  const tcgPrices: Record<string, any> = {};
  let cardmarket: any = undefined;
  let updatedAt = "";

  for (const v of variants) {
    const tp = v?.pricing?.tcgplayer;
    if (tp) {
      for (const [key, val] of Object.entries(tp)) {
        if (key === "unit" || key === "updated" || !val || typeof val !== "object") continue;
        const p = val as any;
        const market = num(p.marketPrice) ?? num(p.midPrice) ?? num(p.lowPrice);
        if (!market) continue;
        const bucket =
          key === "holofoil" || key === "normal" || key === "reverseHolofoil"
            ? key
            : key.replace(/\s+/g, "");
        const existing = tcgPrices[bucket];
        if (!existing || market > existing.market) {
          tcgPrices[bucket] = {
            low: num(p.lowPrice) ?? market,
            mid: num(p.midPrice) ?? market,
            high: num(p.highPrice) ?? market,
            market,
            directLow: num(p.directLowPrice),
          };
        }
      }
      if (tp.updated) updatedAt = tp.updated;
    }

    const cm = v?.pricing?.cardmarket;
    if (cm && !cardmarket) {
      cardmarket = {
        url: `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(c.name)}`,
        updatedAt: cm.updated || "",
        prices: {
          averageSellPrice: num(cm.avg),
          lowPrice: num(cm.low),
          trendPrice: num(cm.trend),
          avg1: num(cm.avg1),
          avg7: num(cm.avg7),
          avg30: num(cm.avg30),
        },
      };
    }
  }

  if (Object.keys(tcgPrices).length === 0 && !cardmarket) return null;

  const image = c.image ? `${c.image}/high.webp` : undefined;
  if (!image) return null;

  return {
    id: c.id,
    name: c.name,
    number: String(c.localId ?? ""),
    rarity: c.rarity,
    supertype: c.category === "Pokemon" ? "Pokémon" : c.category || "Pokémon",
    set: {
      id: c.set?.id ?? "",
      name: c.set?.name ?? "",
      series: c.set?.serie?.name ?? "",
    },
    images: { small: `${c.image}/low.webp`, large: image },
    ...(Object.keys(tcgPrices).length
      ? {
          tcgplayer: {
            url: `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(c.name)}`,
            updatedAt,
            prices: tcgPrices,
          },
        }
      : {}),
    ...(cardmarket ? { cardmarket } : {}),
    _source: "tcgdex",
  };
}

/** Hydrate briefs (which carry no pricing) with per-card detail, in parallel batches. */
async function hydrate(briefs: Brief[], limit: number): Promise<any[]> {
  const out: any[] = [];
  const queue = briefs.filter((b) => b?.id).slice(0, Math.max(limit * 3, limit));
  const BATCH = 24;

  for (let i = 0; i < queue.length && out.length < limit; i += BATCH) {
    const batch = queue.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((b) => getJson<any>(`${TCGDEX}/cards/${encodeURIComponent(b.id)}`, 6000))
    );
    for (const r of results) {
      const mapped = r ? mapCard(r) : null;
      if (mapped) out.push(mapped);
    }
  }
  return out;
}

function bestMarket(card: any): number {
  const prices = card?.tcgplayer?.prices ?? {};
  let best = 0;
  for (const p of Object.values<any>(prices)) {
    if (p?.market > best) best = p.market;
  }
  if (!best) best = card?.cardmarket?.prices?.trendPrice ?? card?.cardmarket?.prices?.averageSellPrice ?? 0;
  return best;
}

function parseQuery(q?: string) {
  const out: { setId?: string; names: string[] } = { names: [] };
  if (!q) return out;
  const setMatch = q.match(/set\.id:([A-Za-z0-9.\-]+)/);
  if (setMatch) out.setId = setMatch[1];
  for (const m of q.matchAll(/name:\*?([A-Za-z0-9'.\-]+)\*?/g)) {
    if (m[1]) out.names.push(m[1]);
  }
  return out;
}

async function collectBriefs(q: string | undefined, limit: number): Promise<Brief[]> {
  const { setId, names } = parseQuery(q);

  if (setId) {
    const set = await getJson<any>(`${TCGDEX}/sets/${encodeURIComponent(setId)}`);
    return (set?.cards ?? []) as Brief[];
  }

  if (names.length) {
    const lists = await Promise.all(
      names.slice(0, 2).map((n) =>
        getJson<Brief[]>(
          `${TCGDEX}/cards?name=like:${encodeURIComponent(n)}&pagination:itemsPerPage=${Math.min(limit * 3, 120)}`
        )
      )
    );
    const seen = new Set<string>();
    const merged: Brief[] = [];
    for (const list of lists) {
      for (const b of list ?? []) {
        if (b?.id && !seen.has(b.id)) {
          seen.add(b.id);
          merged.push(b);
        }
      }
    }
    return merged;
  }

  // Default pool: newest high-value sets, interleaved so we get variety.
  const sets = await Promise.all(
    HIGH_VALUE_SETS.slice(0, 8).map((s) => getJson<any>(`${TCGDEX}/sets/${s}`))
  );
  const buckets = sets.map((s) => ((s?.cards ?? []) as Brief[]).slice().reverse());
  const merged: Brief[] = [];
  const max = Math.max(0, ...buckets.map((b) => b.length));
  for (let i = 0; i < max; i++) {
    for (const b of buckets) if (b[i]) merged.push(b[i]);
  }
  return merged;
}

async function fallbackSets() {
  const sets = await getJson<any[]>(`${TCGDEX}/sets`);
  if (!sets) return null;
  const data = sets
    .map((s) => ({
      id: s.id,
      name: s.name,
      series: s.serie?.name ?? "",
      printedTotal: s.cardCount?.official ?? 0,
      total: s.cardCount?.total ?? 0,
      releaseDate: s.releaseDate ?? "",
      updatedAt: s.releaseDate ?? "",
      images: {
        symbol: s.symbol ? `${s.symbol}.webp` : "",
        logo: s.logo ? `${s.logo}.webp` : "",
      },
      _source: "tcgdex",
    }))
    .sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));
  return { data, page: 1, pageSize: data.length, count: data.length, totalCount: data.length };
}

/**
 * Serve a pokemontcg.io-shaped response from TCGdex.
 * Returns null when the fallback can't produce usable data.
 */
export async function tcgdexFallback(
  path: string,
  params?: Record<string, string>
): Promise<Record<string, unknown> | null> {
  const cleanPath = path.split("?")[0];

  if (cleanPath.startsWith("/sets")) {
    return await fallbackSets();
  }

  // Single card by id: /cards/{id}
  const idMatch = cleanPath.match(/^\/cards\/(.+)$/);
  if (idMatch) {
    const card = await getJson<any>(`${TCGDEX}/cards/${encodeURIComponent(idMatch[1])}`);
    const mapped = card ? mapCard(card) : null;
    return mapped ? { data: mapped } : null;
  }

  if (cleanPath !== "/cards") return null;

  const limit = Math.min(Number(params?.pageSize ?? 50) || 50, 60);
  const briefs = await collectBriefs(params?.q, limit);
  if (!briefs.length) return null;

  const cards = await hydrate(briefs, limit);
  if (!cards.length) return null;

  cards.sort((a, b) => bestMarket(b) - bestMarket(a));

  return {
    data: cards,
    page: 1,
    pageSize: cards.length,
    count: cards.length,
    totalCount: cards.length,
    _source: "tcgdex",
  };
}
