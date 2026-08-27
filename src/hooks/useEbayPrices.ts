import { useQuery } from "@tanstack/react-query";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const URL_ = `https://${PROJECT_ID}.supabase.co/functions/v1/ebay-pricing`;

export interface EbayPriceResult {
  query: string;
  median: number;
  low: number;
  high: number;
  count: number;
  changePct?: number;
  sampleUrl: string;
}

interface EbayPricingResponse {
  results: EbayPriceResult[];
  fetchedAt: string;
  cached?: boolean;
}

export type EbayMarketType = "raw" | "graded" | "sealed";

async function fetchEbayPrices(
  queries: string[],
  conditionIds = "1000|3000|2750",
  marketType: EbayMarketType = "raw"
): Promise<EbayPricingResponse> {
  const res = await fetch(URL_, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ queries, conditionIds, marketType }),
  });
  if (!res.ok) throw new Error(`ebay-pricing ${res.status}`);
  return res.json();
}

/**
 * Pull median eBay Browse API prices for a batch of queries (card names / set names).
 * Used by the live ticker and era indexes as the primary price source.
 */
export function useEbayPrices(queries: string[], conditionIds?: string, marketType: EbayMarketType = "raw") {
  const sorted = [...queries].sort();
  return useQuery({
    queryKey: ["ebay-prices", marketType, sorted.join("|"), conditionIds || ""],
    queryFn: () => fetchEbayPrices(sorted, conditionIds, marketType),
    enabled: sorted.length > 0,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** Build a {query: median} lookup for quick component access. */
export function ebayPriceMap(results?: EbayPriceResult[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of results ?? []) if (r.median > 0) out[r.query.toLowerCase()] = r.median;
  return out;
}

/** Build a {query: changePct} lookup for live ticker movement. */
export function ebayChangeMap(results?: EbayPriceResult[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of results ?? []) if (typeof r.changePct === "number") out[r.query.toLowerCase()] = r.changePct;
  return out;
}
