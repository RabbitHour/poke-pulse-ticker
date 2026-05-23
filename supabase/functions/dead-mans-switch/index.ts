// Dead-Man's Switch — emails PGVA dev team if index_cache hasn't updated in >10 minutes.
// Schedule via pg_cron to run every 5 minutes.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const ALERT_EMAIL = "contact@poke-pulse-ticker.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Service-role only (cron-invoked)
  const authToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!authToken || authToken !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }



  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BREVO_KEY = Deno.env.get("BREVO_API_KEY");

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: cache, error } = await sb
      .from("index_cache")
      .select("cache_key, updated_at")
      .eq("cache_key", "market_indexes")
      .maybeSingle();

    const now = Date.now();
    const lastUpdate = cache?.updated_at ? new Date(cache.updated_at).getTime() : 0;
    const ageMs = now - lastUpdate;
    const isStale = !cache || ageMs > STALE_THRESHOLD_MS;

    const result = {
      ok: !isStale,
      stale: isStale,
      ageMinutes: Math.floor(ageMs / 60000),
      cacheFound: !!cache,
      error: error?.message || null,
    };

    if (isStale && BREVO_KEY) {
      // Send alert email via Brevo
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": BREVO_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "PGVA Dead-Man's Switch", email: "noreply@notify.poke-pulse-ticker.com" },
          to: [{ email: ALERT_EMAIL, name: "PGVA Dev Team" }],
          subject: `🚨 ALERT: index_cache stale for ${result.ageMinutes} min`,
          htmlContent: `
            <h2>Dead-Man's Switch triggered</h2>
            <p><strong>index_cache</strong> hasn't updated in <strong>${result.ageMinutes} minutes</strong> (threshold: 10 min).</p>
            <p>Cache found: ${result.cacheFound}</p>
            <p>Triggered at: ${new Date().toISOString()}</p>
            <p>Action required: investigate the index refresh pipeline.</p>
          `,
        }),
      }).catch((e) => console.error("Failed to send alert email:", e));
    }

    return new Response(JSON.stringify(result), {
      status: isStale ? 503 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("dead-mans-switch error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
