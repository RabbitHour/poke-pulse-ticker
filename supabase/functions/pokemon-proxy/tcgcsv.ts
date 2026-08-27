// Free TCGplayer price source: TCGcsv (https://tcgcsv.com) — no API key required.
// Mirrors TCGplayer's own daily product + price feeds (category 3 = Pokemon)
// and normalizes them into the pokemontcg.io envelope the client expects.

const TCGCSV = "https://tcgcsv.com/tcgplayer/3";
const IMG = (productId: number, size = 200) =>
  `https://tcgplayer-cdn.tcgplayer.com/product/${productId}_${size}w.jpg`;

interface Group { groupId: number; name: string; abbreviation?: string; publishedOn?: string }
interface Product {
  productId: number;
  name: string;
  cleanName?: string;
  imageUrl?: string;
  groupId: number;
  url?: string;
  extendedData?: { name: string; value: string }[];
}
interface Price {
  productId: number;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
  directLowPrice: number | null;
  subTypeName: string;
}

async function getResults<T>(url: string, timeoutMs = 8000): Promise<T[] | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "PokePulseTicker/1.0 (+https://poke-pulse-ticker.com)" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const results = Array.isArray(json) ? json : json?.results;
    return Array.isArray(results) ? (results as T[]) : null;
  } catch {
    return null;
  }
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && isFinite(v) && v > 0 ? v : undefined;
}

const SUBTYPE_MAP: Record<string, string> = {
  "Normal": "normal",
  "Holofoil": "holofoil",
  "Reverse Holofoil": "reverseHolofoil",
  "1st Edition Holofoil": "1stEditionHolofoil",
  "1st Edition Normal": "1stEditionNormal",
  "Unlimited Holofoil": "holofoil",
  "Unlimited": "normal",
};

function ext(p: Product, key: string): string | undefined {
  return p.extendedData?.find((e) => e.name?.toLowerCase() === key.toLowerCase())?.value;
}

/** Sealed / non-single products we don't want in the singles pool. */
function isSingle(p: Product): boolean {
  const n = p.name.toLowerCase();
  if (/booster|elite trainer|box|bundle|tin|collection|blister|deck|case|pack$/.test(n)) return false;
  return !!ext(p, "Number");
}

function buildCard(p: Product, prices: Price[], group: Group) {
  const tcgPrices: Record<string, unknown> = {};
  for (const pr of prices) {
    const bucket = SUBTYPE_MAP[pr.subTypeName] ?? pr.subTypeName.replace(/\s+/g, "");
    const market = num(pr.marketPrice) ?? num(pr.midPrice) ?? num(pr.lowPrice);
    if (!market) continue;
    const existing = tcgPrices[bucket] as { market: number } | undefined;
    if (!existing || market > existing.market) {
      tcgPrices[bucket] = {
        low: num(pr.lowPrice) ?? market,
        mid: num(pr.midPrice) ?? market,
        high: num(pr.highPrice) ?? market,
        market,
        directLow: num(pr.directLowPrice),
      };
    }
  }
  if (Object.keys(tcgPrices).length === 0) return null;

  const number = ext(p, "Number") ?? "";
  return {
    id: `tcgcsv-${p.productId}`,
    name: p.name.replace(/\s*\([^)]*\)\s*$/, "").trim(),
    number: number.split("/")[0] || String(p.productId),
    rarity: ext(p, "Rarity"),
    supertype: ext(p, "Card Type") ?? "Pokémon",
    set: { id: String(group.groupId), name: group.name, series: "" },
    images: { small: IMG(p.productId, 200), large: IMG(p.productId, 400) },
    tcgplayer: {
      url: p.url ?? `https://www.tcgplayer.com/product/${p.productId}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      prices: tcgPrices,
    },
    _source: "tcgcsv",
  };
}

function bestMarket(card: { tcgplayer?: { prices: Record<string, { market: number }> } }): number {
  let best = 0;
  for (const p of Object.values(card.tcgplayer?.prices ?? {})) {
    if (p?.market > best) best = p.market;
  }
  return best;
}

async function recentGroups(count: number): Promise<Group[]> {
  const groups = await getResults<Group>(`${TCGCSV}/groups`);
  if (!groups?.length) return [];
  return groups
    .slice()
    .sort((a, b) => (b.publishedOn ?? "").localeCompare(a.publishedOn ?? ""))
    .slice(0, count);
}

async function cardsForGroup(group: Group, wantSingles = true) {
  const [products, prices] = await Promise.all([
    getResults<Product>(`${TCGCSV}/${group.groupId}/products`, 10000),
    getResults<Price>(`${TCGCSV}/${group.groupId}/prices`, 10000),
  ]);
  if (!products?.length || !prices?.length) return [];

  const byProduct = new Map<number, Price[]>();
  for (const pr of prices) {
    const list = byProduct.get(pr.productId) ?? [];
    list.push(pr);
    byProduct.set(pr.productId, list);
  }

  const out: ReturnType<typeof buildCard>[] = [];
  for (const p of products) {
    if (wantSingles && !isSingle(p)) continue;
    const pr = byProduct.get(p.productId);
    if (!pr?.length) continue;
    const card = buildCard(p, pr, group);
    if (card) out.push(card);
  }
  return out.filter(Boolean);
}

function parseNames(q?: string): string[] {
  if (!q) return [];
  const names: string[] = [];
  for (const m of q.matchAll(/name:\*?([A-Za-z0-9'.\-]+)\*?/g)) if (m[1]) names.push(m[1]);
  return names;
}

/**
 * Serve a pokemontcg.io-shaped response backed by TCGplayer's own free daily feeds.
 * Returns null when the source can't produce usable data.
 */
export async function tcgcsvFallback(
  path: string,
  params?: Record<string, string>
): Promise<Record<string, unknown> | null> {
  const cleanPath = path.split("?")[0];

  if (cleanPath.startsWith("/sets")) {
    const groups = await recentGroups(250);
    if (!groups.length) return null;
    const data = groups.map((g) => ({
      id: String(g.groupId),
      name: g.name,
      series: "",
      printedTotal: 0,
      total: 0,
      releaseDate: (g.publishedOn ?? "").slice(0, 10),
      updatedAt: g.publishedOn ?? "",
      images: { symbol: "", logo: "" },
      _source: "tcgcsv",
    }));
    return { data, page: 1, pageSize: data.length, count: data.length, totalCount: data.length };
  }

  if (cleanPath !== "/cards") return null;

  const limit = Math.min(Number(params?.pageSize ?? 50) || 50, 250);
  const groups = await recentGroups(6);
  if (!groups.length) return null;

  const batches = await Promise.all(groups.map((g) => cardsForGroup(g)));
  let cards = batches.flat();

  const names = parseNames(params?.q).map((n) => n.toLowerCase());
  if (names.length) {
    cards = cards.filter((c) => names.some((n) => c!.name.toLowerCase().includes(n)));
  }

  if (!cards.length) return null;

  cards.sort((a, b) => bestMarket(b!) - bestMarket(a!));
  const sliced = cards.slice(0, limit);

  return {
    data: sliced,
    page: 1,
    pageSize: sliced.length,
    count: sliced.length,
    totalCount: cards.length,
    _source: "tcgcsv",
  };
}
