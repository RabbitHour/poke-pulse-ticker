// eBay Browse API pricing edge function.
// Returns median sold/active listing prices for a list of queries.
// Used by the ticker + era indexes as the primary price source.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-timestamp",
};

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const EPN_CAMPAIGN_ID = "5339151162";

interface CachedToken {
  token: string;
  expiresAt: number;
}
let cachedToken: CachedToken | null = null;

async function getEbayToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const clientId = Deno.env.get("EBAY_CLIENT_ID");
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Missing EBAY_CLIENT_ID / EBAY_CLIENT_SECRET");

  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(EBAY_OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });
  if (!res.ok) throw new Error(`eBay OAuth ${res.status}: ${await res.text()}`);
  const json = await res.json();
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.token;
}

interface PriceResult {
  query: string;
  median: number;
  low: number;
  high: number;
  count: number;
  sampleUrl: string;
}

async function fetchPriceForQuery(token: string, query: string, conditionIds = "1000|3000|2750"): Promise<PriceResult> {
  const url = new URL(EBAY_BROWSE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "20");
  url.searchParams.set("filter", `conditionIds:{${conditionIds}},buyingOptions:{FIXED_PRICE|AUCTION},priceCurrency:USD`);
  url.searchParams.set("sort", "price");

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
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return { query, median: 0, low: 0, high: 0, count: 0, sampleUrl: "" };
  }
  // Trim 10% extremes for robustness
  const trim = Math.floor(prices.length * 0.1);
  const trimmed = prices.slice(trim, prices.length - trim || prices.length);
  const median = trimmed[Math.floor(trimmed.length / 2)];
  return {
    query,
    median: Math.round(median * 100) / 100,
    low: trimmed[0],
    high: trimmed[trimmed.length - 1],
    count: prices.length,
    sampleUrl: items[0]?.itemWebUrl || "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require authenticated user
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const queries: string[] = Array.isArray(body.queries) ? body.queries.slice(0, 30) : [];
    const conditionIds: string = typeof body.conditionIds === "string" ? body.conditionIds : "1000|3000|2750";
    if (queries.length === 0) {
      return new Response(JSON.stringify({ error: "queries[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache key per query batch (5-min TTL) to limit Browse API calls
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const cacheKey = `ebay_pricing:${conditionIds}:${queries.slice().sort().join("|")}`;
    const { data: cached } = await supabase
      .from("index_cache")
      .select("data, expires_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
      return new Response(JSON.stringify({ ...cached.data, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily quota guard — eBay Browse API free tier = 5,000 calls/day.
    // Hard-stop at 4,000 to leave headroom and avoid rate-limit bans.
    const today = new Date().toISOString().split("T")[0];
    const quotaKey = `ebay_quota:${today}`;
    const { data: quotaRow } = await supabase
      .from("index_cache").select("data").eq("cache_key", quotaKey).maybeSingle();
    const usedToday: number = (quotaRow?.data as any)?.calls ?? 0;
    if (usedToday + queries.length > 4000) {
      // Serve any expired cache rather than burn quota
      if (cached) {
        return new Response(JSON.stringify({ ...cached.data, cached: true, quotaCapped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ results: [], quotaCapped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getEbayToken();
    const results = await Promise.all(
      queries.map((q) => fetchPriceForQuery(token, q, conditionIds).catch(() => ({
        query: q, median: 0, low: 0, high: 0, count: 0, sampleUrl: "",
      })))
    );

    // Increment daily quota
    await supabase.from("index_cache").upsert({
      cache_key: quotaKey,
      data: { calls: usedToday + queries.length },
      expires_at: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "cache_key" });

    const payload = { results, fetchedAt: new Date().toISOString() };
    await supabase.from("index_cache").upsert({
      cache_key: cacheKey,
      data: payload,
      // 30-min server cache → ~48 batches/day worst case = well under quota
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }, { onConflict: "cache_key" });

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
