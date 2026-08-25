import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SourceProbe {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  requiresKey?: string; // env var name; if missing, marked degraded
  timeoutMs?: number;
}

async function getEbayOAuthToken(): Promise<string> {
  const clientId = Deno.env.get("EBAY_CLIENT_ID");
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("missing EBAY_CLIENT_ID/SECRET");

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) throw new Error(`oauth ${res.status}`);
  const json = await res.json();
  if (!json.access_token) throw new Error("oauth missing access_token");
  return json.access_token as string;
}

const PROBES: SourceProbe[] = [
  { name: "tcgplayer", url: "https://api.pokemontcg.io/v2/cards?pageSize=1", timeoutMs: 4000 },
  { name: "tcgdex", url: "https://api.tcgdex.net/v2/en/sets/sv08.5", timeoutMs: 5000 },
  { name: "ebay",      url: "https://api.ebay.com/buy/browse/v1/item_summary/search?q=pokemon&limit=1", timeoutMs: 4000 },
  { name: "pricecharting", url: "https://www.pricecharting.com/api/products?q=charizard&type=pokemon-cards", requiresKey: "PRICECHARTING_API_KEY", timeoutMs: 4000 },
  { name: "cardladder", url: "https://api.cardladder.com/v1/health", requiresKey: "CARDLADDER_API_KEY", timeoutMs: 4000 },
  { name: "probstein",  url: "https://probsteinauctions.com/rss/sold?category=pokemon", timeoutMs: 5000 },
  { name: "onethirtypoint", url: "https://130point.com/sales/?q=charizard", timeoutMs: 6000 },
  // Firecrawl-powered sources — probe Firecrawl API health (one shared key gates all 3)
  { name: "pokemonio", url: "https://api.firecrawl.dev/v2/health", requiresKey: "FIRECRAWL_API_KEY", timeoutMs: 4000 },
  { name: "rarecandy", url: "https://api.firecrawl.dev/v2/health", requiresKey: "FIRECRAWL_API_KEY", timeoutMs: 4000 },
  { name: "pokescope", url: "https://api.firecrawl.dev/v2/health", requiresKey: "FIRECRAWL_API_KEY", timeoutMs: 4000 },
];

// Mirrors the daily rotation in the pokemon-proxy edge function.
const ROTATION = ["pokemontcg", "tcgdex"] as const;
function rotationToday() {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const order = ROTATION.map((_, i) => ROTATION[(dayIndex + i) % ROTATION.length]);
  return { primarySource: order[0], sourceOrder: order, rotatesAt: new Date((dayIndex + 1) * 86_400_000).toISOString() };
}


async function probe(p: SourceProbe): Promise<{ name: string; isLive: boolean; latencyMs: number; reason?: string }> {
  if (p.name === "ebay") {
    const t0 = Date.now();
    try {
      const token = await getEbayOAuthToken();
      const res = await fetch(p.url, {
        method: p.method || "GET",
        headers: {
          "User-Agent": "PokePulseTicker/1.0",
          Authorization: `Bearer ${token}`,
          ...(p.headers || {}),
        },
        signal: AbortSignal.timeout(p.timeoutMs ?? 5000),
      });
      const ms = Date.now() - t0;
      return { name: p.name, isLive: res.ok, latencyMs: ms, reason: res.ok ? undefined : `HTTP ${res.status}` };
    } catch (e) {
      return { name: p.name, isLive: false, latencyMs: Date.now() - t0, reason: e instanceof Error ? e.message : String(e) };
    }
  }

  if (p.requiresKey && !Deno.env.get(p.requiresKey)) {
    return { name: p.name, isLive: false, latencyMs: 0, reason: `missing ${p.requiresKey}` };
  }
  const headers: Record<string, string> = { "User-Agent": "PokePulseTicker/1.0", ...(p.headers || {}) };
  if (p.requiresKey === "FIRECRAWL_API_KEY") headers["Authorization"] = `Bearer ${Deno.env.get("FIRECRAWL_API_KEY")}`;

  const t0 = Date.now();
  try {
    const res = await fetch(p.url, { method: p.method || "GET", headers, signal: AbortSignal.timeout(p.timeoutMs ?? 5000) });
    const ms = Date.now() - t0;
    return { name: p.name, isLive: res.ok, latencyMs: ms, reason: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    return { name: p.name, isLive: false, latencyMs: Date.now() - t0, reason: e instanceof Error ? e.message : String(e) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Service-role only — frontend should read cached `pricing_health` row from index_cache instead
  const authToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!authToken || authToken !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }



  try {
    const results = await Promise.all(PROBES.map(probe));
    const liveCount = results.filter(r => r.isLive).length;
    const total = PROBES.length;
    const signalStrength = Math.round((liveCount / total) * 100);

    const payload = {
      signalStrength,
      liveCount,
      totalSources: total,
      sources: results,
      checkedAt: new Date().toISOString(),
    };

    // Cache in index_cache for fast UI reads
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await supabase.from("index_cache").upsert({
        cache_key: "pricing_health",
        data: payload,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      }, { onConflict: "cache_key" });
    } catch (e) {
      console.error("cache write failed", e);
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
