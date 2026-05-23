import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Service-role only (cron-invoked)
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Analyze affiliate click performance over last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: clicks } = await supabase
      .from("affiliate_clicks")
      .select("partner, card_name, card_set")
      .gte("clicked_at", sevenDaysAgo);

    if (!clicks || clicks.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No click data yet" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate by card
    const cardClicks: Record<string, { total: number; tcgplayer: number; ebay: number; card_set: string }> = {};
    for (const click of clicks) {
      const key = click.card_name || "unknown";
      if (!cardClicks[key]) cardClicks[key] = { total: 0, tcgplayer: 0, ebay: 0, card_set: click.card_set || "" };
      cardClicks[key].total++;
      if (click.partner === "tcgplayer") cardClicks[key].tcgplayer++;
      if (click.partner === "ebay") cardClicks[key].ebay++;
    }

    // Sort by clicks to find top performers
    const topCards = Object.entries(cardClicks)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 20);

    // Calculate partner performance
    const partnerStats = {
      tcgplayer: { clicks: 0, est_revenue: 0 },
      ebay: { clicks: 0, est_revenue: 0 },
    };
    for (const click of clicks) {
      if (click.partner === "tcgplayer") {
        partnerStats.tcgplayer.clicks++;
        partnerStats.tcgplayer.est_revenue += 0.08;
      } else if (click.partner === "ebay") {
        partnerStats.ebay.clicks++;
        partnerStats.ebay.est_revenue += 0.12;
      }
    }

    const totalEstRevenue = partnerStats.tcgplayer.est_revenue + partnerStats.ebay.est_revenue;

    // Update daily metrics
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("sales_pipeline_metrics")
      .select("*")
      .eq("metric_date", today)
      .maybeSingle();

    if (existing) {
      await supabase.from("sales_pipeline_metrics").update({
        demos_booked: clicks.length, // repurpose as affiliate_clicks_today
      }).eq("id", existing.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_clicks_7d: clicks.length,
        estimated_revenue_7d: `$${totalEstRevenue.toFixed(2)}`,
        top_cards: topCards.map(([name, stats]) => ({
          card: name,
          clicks: stats.total,
          best_partner: stats.ebay > stats.tcgplayer ? "ebay" : "tcgplayer",
        })),
        partner_breakdown: partnerStats,
        recommendation: partnerStats.ebay.est_revenue > partnerStats.tcgplayer.est_revenue
          ? "eBay links generate more revenue — prioritize eBay placement"
          : "TCGPlayer links generate more revenue — prioritize TCGPlayer placement",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Affiliate optimizer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
