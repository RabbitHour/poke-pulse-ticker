import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEO_TOPICS = [
  "pokemon card prices today top movers",
  "best pokemon cards to invest in 2026",
  "pokemon card grading ROI guide",
  "sealed pokemon product investment analysis",
  "rare pokemon card price predictions",
  "pokemon TCG market trends weekly",
  "how to spot undervalued pokemon cards",
  "pokemon card arbitrage opportunities",
  "vintage vs modern pokemon card values",
  "PSA graded pokemon card price guide",
  "pokemon booster box investment returns",
  "pokemon card market crash or correction",
  "top pokemon sets for collectors 2026",
  "pokemon card flipping guide beginners",
  "holographic pokemon card price tracker",
  "japanese pokemon card price differences",
  "pokemon card portfolio building strategy",
  "best raw pokemon cards under 50 dollars",
  "pokemon elite trainer box sealed value",
  "pokemon card market index explained",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require service-role authorization (cron only).
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!token || token !== serviceKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pick a random topic
    const topic = SEO_TOPICS[Math.floor(Math.random() * SEO_TOPICS.length)];
    const today = new Date().toISOString().split("T")[0];

    // Check if we already published today
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .gte("created_at", `${today}T00:00:00Z`)
      .lte("created_at", `${today}T23:59:59Z`)
      .eq("published", true)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ success: true, message: "Already published today" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate SEO blog post via AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert Pokémon TCG market analyst and SEO content writer for Poke-Pulse-Engine™ (poke-pulse-ticker.com). Write engaging, data-driven blog posts that rank for Pokemon card investment keywords. Include specific card names, set names, price ranges, and actionable advice. Use markdown formatting. Posts should be 800-1200 words. Include a compelling meta description under 160 characters. Always mention Poke-Pulse-Engine™ tools naturally (Alpha Signals, Arbitrage Finder, Portfolio Tracker, Grading ROI Calculator).`,
          },
          {
            role: "user",
            content: `Write an SEO-optimized blog post about: "${topic}". Date: ${today}. Return JSON with fields: title (under 60 chars with keyword), slug (url-safe), excerpt (meta description under 160 chars), content (full markdown article).`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_blog_post",
              description: "Create an SEO blog post",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  slug: { type: "string" },
                  excerpt: { type: "string" },
                  content: { type: "string" },
                },
                required: ["title", "slug", "excerpt", "content"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_blog_post" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const post = JSON.parse(toolCall.function.arguments);

    // Ensure unique slug
    const uniqueSlug = `${post.slug}-${today}`;

    // Get a system author ID (first admin or create system user)
    // Use a deterministic UUID for the system author
    const SYSTEM_AUTHOR_ID = "00000000-0000-0000-0000-000000000001";

    const { error: insertError } = await supabase.from("blog_posts").insert({
      title: post.title,
      slug: uniqueSlug,
      excerpt: post.excerpt,
      content: post.content,
      published: true,
      author_id: SYSTEM_AUTHOR_ID,
    });

    if (insertError) throw insertError;

    // Also post to Buffer if available
    const BUFFER_API_KEY = Deno.env.get("BUFFER_API_KEY");
    if (BUFFER_API_KEY) {
      try {
        const tweetText = `📊 New on Poke-Pulse-Engine™: ${post.title}\n\n${post.excerpt}\n\n🔗 https://poke-pulse-ticker.com/blog/${uniqueSlug}\n\n#PokemonTCG #PokemonCards #CardInvesting`;
        
        // Get Buffer profiles
        const profilesRes = await fetch("https://api.bufferapp.com/1/profiles.json", {
          headers: { Authorization: `Bearer ${BUFFER_API_KEY}` },
        });
        
        if (profilesRes.ok) {
          const profiles = await profilesRes.json();
          for (const profile of profiles.slice(0, 3)) {
            await fetch("https://api.bufferapp.com/1/updates/create.json", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${BUFFER_API_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                text: tweetText,
                profile_ids: profile.id,
              }),
            }).catch(() => {});
          }
        }
      } catch {
        // Buffer posting is best-effort
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        title: post.title,
        slug: uniqueSlug,
        topic,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Content engine error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
