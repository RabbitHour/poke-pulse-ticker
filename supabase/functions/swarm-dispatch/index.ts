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

    const isFederal = preset === "federal";
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
