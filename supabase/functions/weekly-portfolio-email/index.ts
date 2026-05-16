import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get all users with portfolio cards and notification preferences enabled
    const { data: preferences } = await adminClient
      .from("notification_preferences")
      .select("user_id, email_portfolio_alerts")
      .eq("email_portfolio_alerts", true);

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with portfolio email alerts enabled", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;

    for (const pref of preferences) {
      const userId = pref.user_id;

      // Get user email from auth
      const { data: { user } } = await adminClient.auth.admin.getUserById(userId);
      if (!user?.email) continue;

      // Get portfolio cards
      const { data: cards } = await adminClient
        .from("portfolio_cards")
        .select("*")
        .eq("user_id", userId);

      if (!cards || cards.length === 0) continue;

      // Get latest two snapshots for weekly change
      const { data: snapshots } = await adminClient
        .from("portfolio_snapshots")
        .select("total_value, total_cost, card_count, snapshot_date")
        .eq("user_id", userId)
        .order("snapshot_date", { ascending: false })
        .limit(8);

      const latestValue = snapshots?.[0]?.total_value ?? 0;
      const weekAgoValue = snapshots?.[7]?.total_value ?? snapshots?.[snapshots?.length ? snapshots.length - 1 : 0]?.total_value ?? latestValue;

      const weeklyChange = latestValue - weekAgoValue;
      const weeklyChangePercent = weekAgoValue > 0 ? ((weeklyChange / weekAgoValue) * 100) : 0;

      // Get display name
      const { data: profile } = await adminClient
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      // Send email via transactional email system
      const { error } = await adminClient.functions.invoke("send-transactional-email", {
        body: {
          templateName: "weekly-portfolio-summary",
          recipientEmail: user.email,
          idempotencyKey: `weekly-portfolio-${userId}-${new Date().toISOString().split("T")[0]}`,
          templateData: {
            displayName: profile?.display_name || undefined,
            totalValue: `$${latestValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            weeklyChange: `$${Math.abs(weeklyChange).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            weeklyChangePercent: Math.abs(weeklyChangePercent).toFixed(2),
            isPositive: weeklyChange >= 0,
            cardCount: cards.length,
            topMover: cards[0]?.card_name || "N/A",
            topMoverChange: "+0.00%",
          },
        },
      });

      if (!error) sentCount++;
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Weekly portfolio email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
