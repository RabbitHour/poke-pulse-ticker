// Claude Watchdog — Opus-powered uptime + accuracy sentinel.
// Runs every 5 min via pg_cron. Probes TCGPlayer + eBay (primary) and the rest of the
// pricing-health sources, asks Claude (with Gemini fallback) to diagnose, and emails
// contact@poke-pulse-ticker.com via Brevo if anything is offline or drifting.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_EMAIL = "contact@poke-pulse-ticker.com";
const STALE_MS = 10 * 60 * 1000;

// Try Claude Opus first, then fall back through documented Lovable AI Gateway models.
const MODEL_CHAIN = [
  "anthropic/claude-opus-4-20250514",
  "anthropic/claude-3-5-sonnet-20241022",
  "openai/gpt-5",
  "google/gemini-2.5-pro",
];

interface SourceStatus {
  name: string;
  isLive: boolean;
  latencyMs: number;
  reason?: string;
}

async function probe(name: string, url: string, headers: Record<string, string> = {}, timeoutMs = 5000): Promise<SourceStatus> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PokePulseWatchdog/1.0", ...headers },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { name, isLive: res.ok, latencyMs: Date.now() - t0, reason: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    return { name, isLive: false, latencyMs: Date.now() - t0, reason: e instanceof Error ? e.message : String(e) };
  }
}

async function ebayProbe(): Promise<SourceStatus> {
  const id = Deno.env.get("EBAY_CLIENT_ID");
  const secret = Deno.env.get("EBAY_CLIENT_SECRET");
  if (!id || !secret) return { name: "ebay", isLive: false, latencyMs: 0, reason: "missing EBAY_CLIENT_ID/SECRET" };
  const t0 = Date.now();
  try {
    const tokRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      signal: AbortSignal.timeout(6000),
    });
    if (!tokRes.ok) return { name: "ebay", isLive: false, latencyMs: Date.now() - t0, reason: `oauth ${tokRes.status}` };
    const { access_token } = await tokRes.json();
    const search = await fetch(
      "https://api.ebay.com/buy/browse/v1/item_summary/search?q=charizard&limit=1",
      { headers: { Authorization: `Bearer ${access_token}` }, signal: AbortSignal.timeout(6000) },
    );
    return { name: "ebay", isLive: search.ok, latencyMs: Date.now() - t0, reason: search.ok ? undefined : `search ${search.status}` };
  } catch (e) {
    return { name: "ebay", isLive: false, latencyMs: Date.now() - t0, reason: e instanceof Error ? e.message : String(e) };
  }
}

async function callClaude(prompt: string): Promise<{ model: string; text: string } | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  for (const model of MODEL_CHAIN) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are the Poké-Pulse uptime sentinel. Be terse, bullet-point, actionable. Identify root cause and exact fix." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (r.ok) {
        const j = await r.json();
        const text = j.choices?.[0]?.message?.content ?? "";
        if (text) return { model, text };
      } else {
        console.warn(`model ${model} -> HTTP ${r.status}`);
      }
    } catch (e) {
      console.warn(`model ${model} threw`, e);
    }
  }
  return null;
}

async function emailAlert(subject: string, html: string) {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) return;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { accept: "application/json", "api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Poké-Pulse Claude Watchdog", email: "noreply@notify.poke-pulse-ticker.com" },
      to: [{ email: ALERT_EMAIL, name: "PGVA Dev Team" }],
      subject,
      htmlContent: html,
    }),
  }).catch((e) => console.error("brevo send failed", e));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // 1) Probe primary + secondary sources in parallel.
  const [tcg, ebay, probstein, onethirty] = await Promise.all([
    probe("tcgplayer", "https://api.pokemontcg.io/v2/cards?pageSize=1"),
    ebayProbe(),
    probe("probstein", "https://probsteinauctions.com/rss/sold?category=pokemon"),
    probe("130point", "https://130point.com/sales/?q=charizard", {}, 7000),
  ]);
  const sources: SourceStatus[] = [tcg, ebay, probstein, onethirty];
  const liveCount = sources.filter((s) => s.isLive).length;
  const signalStrength = Math.round((liveCount / sources.length) * 100);

  // 2) Check freshness of index_cache.
  const { data: cache } = await sb
    .from("index_cache")
    .select("cache_key, updated_at")
    .eq("cache_key", "market_indexes")
    .maybeSingle();
  const ageMs = cache?.updated_at ? Date.now() - new Date(cache.updated_at).getTime() : Infinity;
  const isStale = ageMs > STALE_MS;

  // 3) Decide: alert if PRIMARY source down OR cache stale OR signal < 50%.
  const primaryDown = !tcg.isLive || !ebay.isLive;
  const shouldAlert = primaryDown || isStale || signalStrength < 50;

  let claude: { model: string; text: string } | null = null;
  if (shouldAlert) {
    const prompt = `Poké-Pulse uptime probe:
- TCGPlayer: ${tcg.isLive ? "LIVE" : "DOWN"} (${tcg.reason ?? "ok"}, ${tcg.latencyMs}ms)
- eBay: ${ebay.isLive ? "LIVE" : "DOWN"} (${ebay.reason ?? "ok"}, ${ebay.latencyMs}ms)
- Probstein: ${probstein.isLive ? "LIVE" : "DOWN"} (${probstein.reason ?? "ok"})
- 130point: ${onethirty.isLive ? "LIVE" : "DOWN"} (${onethirty.reason ?? "ok"})
- index_cache age: ${Math.floor(ageMs / 60000)} min (stale > 10)
- signal strength: ${signalStrength}%

Diagnose root cause and give the exact fix (env var, edge function, query, or upstream incident). Be terse.`;
    claude = await callClaude(prompt);

    await emailAlert(
      `🚨 Poké-Pulse Watchdog: ${primaryDown ? "PRIMARY SOURCE DOWN" : isStale ? "DATA STALE" : "SIGNAL WEAK"} (${signalStrength}%)`,
      `<h2>Watchdog tripped</h2>
       <p><strong>Signal:</strong> ${signalStrength}% (${liveCount}/${sources.length} live)</p>
       <p><strong>Cache age:</strong> ${Math.floor(ageMs / 60000)} min</p>
       <ul>${sources.map((s) => `<li><b>${s.name}:</b> ${s.isLive ? "✅ live" : `❌ ${s.reason}`} (${s.latencyMs}ms)</li>`).join("")}</ul>
       <h3>Claude diagnosis (${claude?.model ?? "unavailable"}):</h3>
       <pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px">${claude?.text ?? "AI gateway unreachable — investigate manually."}</pre>
       <p style="font-size:12px;color:#64748b">Triggered ${new Date().toISOString()}</p>`,
    );
  }

  // 4) Cache the latest watchdog snapshot for the UI.
  const payload = {
    signalStrength,
    liveCount,
    totalSources: sources.length,
    sources,
    cacheAgeMinutes: ageMs === Infinity ? null : Math.floor(ageMs / 60000),
    isStale,
    alerted: shouldAlert,
    claudeModel: claude?.model ?? null,
    claudeDiagnosis: claude?.text ?? null,
    checkedAt: new Date().toISOString(),
  };
  await sb.from("index_cache").upsert(
    { cache_key: "claude_watchdog", data: payload, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() },
    { onConflict: "cache_key" },
  );

  return new Response(JSON.stringify(payload), {
    status: shouldAlert ? 503 : 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
