import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Send nudges at days 7, 3, and 1 remaining (mapped from 14-day trial)
const NUDGE_WINDOWS = [
  { daysRemaining: 7, tag: "halfway" },
  { daysRemaining: 3, tag: "urgent" },
  { daysRemaining: 1, tag: "last-chance" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    let totalSent = 0;
    const results: any[] = [];

    for (const window of NUDGE_WINDOWS) {
      // Calculate target window: trials ending in `daysRemaining` days (±12hr)
      const targetStart = new Date(now.getTime() + (window.daysRemaining - 0.5) * 24 * 60 * 60 * 1000);
      const targetEnd = new Date(now.getTime() + (window.daysRemaining + 0.5) * 24 * 60 * 60 * 1000);

      const { data: trials, error } = await supabase
        .from("user_trials")
        .select("user_id, ends_at, tier")
        .eq("is_active", true)
        .gte("ends_at", targetStart.toISOString())
        .lte("ends_at", targetEnd.toISOString());

      if (error) {
        console.error("[TRIAL-NUDGE] Query error:", error);
        continue;
      }

      if (!trials || trials.length === 0) {
        results.push({ window: window.tag, count: 0 });
        continue;
      }

      // Get user emails via auth admin
      let sent = 0;
      for (const trial of trials) {
        const { data: userData } = await supabase.auth.admin.getUserById(trial.user_id);
        const email = userData?.user?.email;
        const name = userData?.user?.user_metadata?.name || email?.split("@")[0] || "there";

        if (!email) continue;

        const idempotencyKey = `trial-nudge-${trial.user_id}-${window.tag}`;

        const { error: sendErr } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "trial-nudge",
            recipientEmail: email,
            idempotencyKey,
            templateData: {
              recipientName: name,
              daysRemaining: window.daysRemaining,
              tier: trial.tier === "pro" ? "Pro" : trial.tier,
            },
          },
        });

        if (!sendErr) sent++;
      }

      totalSent += sent;
      results.push({ window: window.tag, count: sent, found: trials.length });
    }

    return new Response(
      JSON.stringify({ success: true, total_sent: totalSent, breakdown: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[TRIAL-NUDGE] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
