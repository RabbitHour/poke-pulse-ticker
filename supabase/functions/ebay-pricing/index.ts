// eBay Browse API pricing edge function.
// Returns median active-listing prices for a list of queries with tight
// relevance filtering so we don't end up medianing sleeves/proxies/lots.
// Also computes a live %change vs the previous cached median per query.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-timestamp",
};

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const EPN_CAMPAIGN_ID = "5339151162";

// eBay category 183454 = Collectible Card Games > Pokémon TCG > Individual Cards
const POKEMON_SINGLES_CATEGORY = "183454";

// Junk keywords excluded with -keyword syntax. Kept short — eBay Browse rejects
// queries that are too long or end up with zero matches.
const RAW_EXCLUDE_TERMS = [
  "lot", "proxy", "custom", "fake", "replica", "metal",
  "sleeve", "playmat", "binder", "japanese",
  "booster", "etb", "pack", "box", "tin", "case",
];

const SEALED_EXCLUDE_TERMS = ["lot", "proxy", "custom", "fake", "replica", "empty", "wrapper"];

interface CachedToken { token: string; expiresAt: number; }
let cachedToken: CachedToken | null = null;

async function getEbayToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const clientId = Deno.env.get("EBAY_CLIENT_ID");
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Missing EBAY_CLIENT_ID / EBAY_CLIENT_SECRET");
  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(EBAY_OAUTH_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });
  if (!res.ok) throw new Error(`eBay OAuth ${res.status}: ${await res.text()}`);
  const json = await res.json();
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.token;
}

interface PriceResult {
  query: string;
  median: number;
  low: number;
  high: number;
  count: number;
  changePct: number;     // vs previous cached median (live, not static)
  sampleUrl: string;
}

/** Build the q= string with negative keywords to drop junk listings. */
function buildQuery(q: string, marketType: "raw" | "graded" | "sealed"): string {
  const terms = marketType === "sealed" ? SEALED_EXCLUDE_TERMS : RAW_EXCLUDE_TERMS;
  const negatives = terms.map((t) => `-${t}`).join(" ");
  return `${q} ${negatives}`;
}

/** Robust median with IQR outlier rejection — kills the $0.99 sleeves and the $9999 BIN troll. */
function robustMedian(values: number[]): { median: number; low: number; high: number; kept: number } {
  if (values.length === 0) return { median: 0, low: 0, high: 0, kept: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const kept = sorted.filter((v) => v >= Math.max(1, lo) && v <= hi);
  if (kept.length === 0) return { median: sorted[Math.floor(sorted.length / 2)], low: sorted[0], high: sorted[sorted.length - 1], kept: sorted.length };
  return {
    median: kept[Math.floor(kept.length / 2)],
    low: kept[0],
    high: kept[kept.length - 1],
    kept: kept.length,
  };
}

async function fetchPriceForQuery(
  token: string,
  query: string,
  conditionIds = "1000|3000|2750",
  marketType: "raw" | "graded" | "sealed" = "raw"
): Promise<Omit<PriceResult, "changePct">> {
  const url = new URL(EBAY_BROWSE_URL);
  url.searchParams.set("q", buildQuery(query, marketType));
  if (marketType !== "sealed") url.searchParams.set("category_ids", POKEMON_SINGLES_CATEGORY);
  url.searchParams.set("limit", "50");
  url.searchParams.set("filter", `conditionIds:{${conditionIds}},buyingOptions:{FIXED_PRICE},priceCurrency:USD,price:[3..]`);
  // Default sort = BestMatch (relevance). DO NOT sort by price asc.

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "X-EBAY-C-ENDUSERCTX": `affiliateCampaignId=${EPN_CAMPAIGN_ID}`,
    },
  });
  if (!res.ok) throw new Error(`Browse ${res.status}`);
  const data = await res.json();
  const items: any[] = data.itemSummaries || [];
  const prices = items
    .map((i) => parseFloat(i?.price?.value))
    .filter((n) => Number.isFinite(n) && n >= 3);

  const { median, low, high, kept } = robustMedian(prices);
  return {
    query,
    median: Math.round(median * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    count: kept,
    sampleUrl: items[0]?.itemWebUrl || "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const queries: string[] = Array.isArray(body.queries) ? body.queries.slice(0, 30) : [];
    const conditionIds: string = typeof body.conditionIds === "string" ? body.conditionIds : "1000|3000|2750";
    const marketType: "raw" | "graded" | "sealed" =
      body.marketType === "graded" || body.marketType === "sealed" ? body.marketType : "raw";
    if (queries.length === 0) {
      return new Response(JSON.stringify({ error: "queries[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const cacheKey = `ebay_pricing:v3:${marketType}:${conditionIds}:${queries.slice().sort().join("|")}`;
    const { data: cached } = await supabase
      .from("index_cache").select("data, expires_at").eq("cache_key", cacheKey).maybeSingle();
    if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
      return new Response(JSON.stringify({ ...(cached.data as any), cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily quota guard (Browse API free tier = 5,000/day; cap at 4,000).
    const today = new Date().toISOString().split("T")[0];
    const quotaKey = `ebay_quota:${today}`;
    const { data: quotaRow } = await supabase
      .from("index_cache").select("data").eq("cache_key", quotaKey).maybeSingle();
    const usedToday: number = (quotaRow?.data as any)?.calls ?? 0;
    if (usedToday + queries.length > 4000) {
      if (cached) {
        return new Response(JSON.stringify({ ...(cached.data as any), cached: true, quotaCapped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ results: [], quotaCapped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getEbayToken();
    const baseResults = await Promise.all(
      queries.map((q) => fetchPriceForQuery(token, q, conditionIds, marketType).catch(() => ({
        query: q, median: 0, low: 0, high: 0, count: 0, sampleUrl: "",
      })))
    );

    // Compute live %change vs previous per-query snapshot.
    const snapKeys = baseResults.map((r) => `ebay_snap:v3:${marketType}:${r.query.toLowerCase()}`);
    const { data: snaps } = await supabase
      .from("index_cache").select("cache_key, data").in("cache_key", snapKeys);
    const snapMap = new Map<string, number>();
    (snaps || []).forEach((s: any) => {
      const prev = (s.data as any)?.median;
      if (typeof prev === "number") snapMap.set(s.cache_key, prev);
    });

    const results: PriceResult[] = baseResults.map((r) => {
      const key = `ebay_snap:v3:${marketType}:${r.query.toLowerCase()}`;
      const prev = snapMap.get(key);
      const changePct = prev && prev > 0 && r.median > 0
        ? Math.round(((r.median - prev) / prev) * 10000) / 100
        : 0;
      return { ...r, changePct };
    });

    // Keep each baseline for a full 24 hours so changePct is a true 24h comparison,
    // not merely movement since the previous 30-minute refresh.
    const snapRowsByKey = new Map((snaps || []).map((snapshot: any) => [snapshot.cache_key, snapshot]));
    const snapRows = results
      .filter((r) => r.median > 0)
      .filter((r) => {
        const key = `ebay_snap:v3:${marketType}:${r.query.toLowerCase()}`;
        const existing = snapRowsByKey.get(key) as any;
        const at = existing?.data?.at ? new Date(existing.data.at).getTime() : 0;
        return !at || Date.now() - at >= 24 * 60 * 60 * 1000;
      })
      .map((r) => ({
        cache_key: `ebay_snap:v3:${marketType}:${r.query.toLowerCase()}`,
        data: { median: r.median, at: new Date().toISOString() } as any,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }));
    if (snapRows.length > 0) {
      await supabase.from("index_cache").upsert(snapRows, { onConflict: "cache_key" });
    }

    await supabase.from("index_cache").upsert({
      cache_key: quotaKey,
      data: { calls: usedToday + queries.length } as any,
      expires_at: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "cache_key" });

    const payload = { results, fetchedAt: new Date().toISOString() };
    await supabase.from("index_cache").upsert({
      cache_key: cacheKey,
      data: payload as any,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }, { onConflict: "cache_key" });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
