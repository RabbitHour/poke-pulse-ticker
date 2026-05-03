// Swarm Dispatcher — fans a single mission out to N specialist agents in parallel
// using the Lovable AI gateway. Owner-only (validated via JWT email).
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const OWNER_EMAIL = "pokegarageva@gmail.com";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type AgentSpec = { name: string; role: string; model?: string };

const PRESETS: Record<string, AgentSpec[]> = {
  civilian: [
    { name: "Strategist", role: "Civilian product/brand strategist for Unicorn AI Builder. Focus on monetization, positioning, growth." },
    { name: "Engineer",   role: "Senior full-stack engineer. Propose concrete React/Supabase implementation steps." },
    { name: "Designer",   role: "Brand & UX designer. Propose visual identity, layout, and accessibility improvements." },
    { name: "Legal",      role: "IP/contract counsel. Flag trademark, licensing, and liability exposure for PGVA Ventures, LLC." },
  ],
  federal: [
    { name: "DefenseAnalyst", role: "Empire Defense analyst. TOP SECRET. Threat modeling, OPSEC, counter-intel. Owner eyes only." },
    { name: "Cryptographer",  role: "Cryptography & zero-trust architecture for Delta Pod. Owner eyes only." },
    { name: "Logistics",      role: "Federal supply-chain & deployment logistics. Owner eyes only." },
    { name: "Counsel",        role: "Federal compliance counsel (DTSA, ITAR-aware). Owner eyes only." },
  ],
  pokepulse: [
    { name: "MarketAnalyst", role: "Poké TCG market analyst. Pricing accuracy, index methodology, signal detection." },
    { name: "Growth",        role: "Growth/affiliate optimization for poke-pulse-ticker.com." },
    { name: "Engineer",      role: "Edge-function & data-pipeline engineer for the ticker." },
  ],
  moat: [
    { name: "MoatArchitect", role: "Competitive-moat architect. Identify defensible advantages (data, network, brand, IP, cost)." },
    { name: "RedTeam",       role: "Red-team adversary. Enumerate attack vectors a competitor would use to erode the moat." },
    { name: "Patent",        role: "Patent strategist. Suggest filings, claims, and trade-secret partitioning." },
  ],
  passive_civilian: [
    { name: "BootstrapStrategist", role: "Zero-to-passive-income strategist. Starting capital ~$40 + raw Pokémon inventory (thousands raw, 15 graded, 16-20 sealed Scarlet/Violet ETBs). Civilian side. Output: week-by-week 12-week plan with revenue targets, channels (eBay/TCGPlayer/Whatnot/affiliate), reinvestment ratios, and compounding milestones." },
    { name: "InventoryLiquidator", role: "Sealed-product & graded-card flipper. Identify which ETBs/grades to sell now vs hold, target prices, listing channels, fees. Convert dormant inventory into seed cash." },
    { name: "ContentMonetizer",    role: "YouTube/TikTok/Shorts + blog SEO around Poké-Pulse data. Affiliate stack (eBay Partner, TCGPlayer, Amazon). Revenue per 1k views. Tools that compound (evergreen ranked posts, autopost cron)." },
    { name: "AutomationEngineer",  role: "Identify what in the existing repo can be turned into a paid autopilot service (alerts, watchlists, audit reports). Propose smallest paid tier we can ship this week." },
    { name: "Accountant",          role: "Track unit economics, runway, breakeven. Flag tax/legal pitfalls for PGVA Ventures, LLC." },
  ],
  passive_federal: [
    { name: "ContractScout",   role: "Federal/defense passive-income scout. SAM.gov, SBIR/STTR, GSA Schedule, Mentor-Protégé, set-asides for SDVOSB/8(a). Identify low-touch recurring contract vehicles a solo LLC can subcontract into. OWNER EYES ONLY." },
    { name: "IPLicensing",     role: "License Empire Defense / Delta Pod IP (patents-pending, trade secrets) to primes (Lockheed, RTX, Anduril) for royalties. Draft term-sheet skeletons. OWNER EYES ONLY." },
    { name: "DataResale",      role: "Identify de-classifiable data products (OSINT feeds, threat indicators) that can be sold by subscription to gov/contractor buyers. OWNER EYES ONLY." },
    { name: "GrantHunter",     role: "Non-dilutive grants (DARPA, AFWERX, DIU, NSF) that pay for R&D we'd do anyway. List open solicitations matching our stack. OWNER EYES ONLY." },
    { name: "ComplianceGate",  role: "Flag ITAR/EAR/CMMC requirements before any federal revenue stream is pursued. OWNER EYES ONLY." },
  ],
};

async function callAgent(agent: AgentSpec, mission: string): Promise<{ name: string; output: string; error?: string }> {
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: agent.model ?? "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are ${agent.name}. ${agent.role} Be terse, bullet-pointed, actionable.` },
          { role: "user",   content: mission },
        ],
      }),
    });
    if (r.status === 429) return { name: agent.name, output: "", error: "rate_limited" };
    if (r.status === 402) return { name: agent.name, output: "", error: "credits_exhausted" };
    if (!r.ok)             return { name: agent.name, output: "", error: `http_${r.status}` };
    const j = await r.json();
    return { name: agent.name, output: j.choices?.[0]?.message?.content ?? "" };
  } catch (e) {
    return { name: agent.name, output: "", error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await supa.auth.getUser();
    if (!u.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const mission: string = (body.mission ?? "").toString().slice(0, 4000);
    const preset: string = (body.preset ?? "civilian").toString();
    if (!mission) return new Response(JSON.stringify({ error: "mission required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const isFederal = preset === "federal" || preset === "passive_federal";
    if (isFederal && u.user.email !== OWNER_EMAIL) {
      return new Response(JSON.stringify({ error: "classified" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const agents = PRESETS[preset] ?? PRESETS.civilian;
    const results = await Promise.all(agents.map((a) => callAgent(a, mission)));
    return new Response(JSON.stringify({ preset, mission, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
