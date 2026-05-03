import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TerminalHeader from "@/components/TerminalHeader";
import CopyrightBanner from "@/components/CopyrightBanner";
import OwnerOnlyGate from "@/components/OwnerOnlyGate";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Network, ShieldAlert, Sparkles, Building2, Crosshair, Lock } from "lucide-react";

type Preset = "civilian" | "federal" | "pokepulse" | "moat" | "passive_civilian" | "passive_federal";
type AgentResult = { name: string; output: string; error?: string };

const PRESET_META: Record<Preset, { label: string; icon: any; tone: string; desc: string; classified?: boolean }> = {
  civilian:         { label: "Civilian — Unicorn AI Builder", icon: Building2, tone: "text-primary",        desc: "Corporations · flagships · brands · Personal Pod (civilian) · Poke-Pulse · products" },
  federal:          { label: "Federal — Empire Defense",      icon: ShieldAlert, tone: "text-destructive",  desc: "Empire Defense Dept · Delta Pod · TOP SECRET · Owner eyes only", classified: true },
  pokepulse:        { label: "Poke-Pulse Ops",                icon: Sparkles, tone: "text-terminal-amber",  desc: "Ticker accuracy · indexes · growth · affiliate ROI" },
  moat:             { label: "Moat & Counter-Intel",          icon: Crosshair, tone: "text-primary",        desc: "Defensive strategy vs competitors / hostile actors" },
  passive_civilian: { label: "Passive — Civilian",            icon: Sparkles, tone: "text-primary",         desc: "Bootstrap $40 + Poké inventory → compounding income (eBay/TCG/affiliate/content)" },
  passive_federal:  { label: "Passive — Federal",             icon: ShieldAlert, tone: "text-destructive",  desc: "SBIR/STTR · IP licensing · OSINT resale · grants. Owner eyes only", classified: true },
};

const Swarm = () => {
  const [preset, setPreset] = useState<Preset>("civilian");
  const [mission, setMission] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AgentResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatch = async () => {
    setLoading(true); setError(null); setResults(null);
    const { data, error } = await supabase.functions.invoke("swarm-dispatch", { body: { preset, mission } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (data?.error) { setError(data.error); return; }
    setResults(data?.results ?? []);
  };

  return (
    <div className="space-y-3">
      <Tabs value={preset} onValueChange={(v) => setPreset(v as Preset)}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full h-auto">
          {(Object.keys(PRESET_META) as Preset[]).map((k) => {
            const M = PRESET_META[k]; const Icon = M.icon;
            return (
              <TabsTrigger key={k} value={k} className="flex-col gap-1 py-2 text-[10px] font-mono">
                <Icon className={`w-3.5 h-3.5 ${M.tone}`} />
                <span>{M.label.split(" — ")[0]}</span>
                {M.classified && <Lock className="w-2.5 h-2.5 text-destructive" />}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {(Object.keys(PRESET_META) as Preset[]).map((k) => (
          <TabsContent key={k} value={k} className="mt-2">
            <p className="font-mono text-[10px] text-muted-foreground">{PRESET_META[k].desc}</p>
          </TabsContent>
        ))}
      </Tabs>

      <textarea
        value={mission}
        onChange={(e) => setMission(e.target.value.slice(0, 4000))}
        placeholder="Mission brief — what do you want the swarm to attack?"
        rows={4}
        className="w-full rounded border border-border bg-background/60 p-2 font-mono text-xs"
      />
      <Button onClick={dispatch} disabled={loading || !mission.trim()} className="w-full">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Network className="w-3.5 h-3.5 mr-1.5" />}
        Dispatch Swarm
      </Button>

      {error && <p className="font-mono text-[10px] text-destructive">⚠ {error}</p>}

      {results && (
        <div className="grid sm:grid-cols-2 gap-2">
          {results.map((r) => (
            <div key={r.name} className="terminal-card p-3">
              <p className="font-mono text-[10px] font-bold text-primary mb-1">{r.name}</p>
              {r.error
                ? <p className="font-mono text-[10px] text-destructive">{r.error}</p>
                : <pre className="font-mono text-[10px] whitespace-pre-wrap text-foreground/90">{r.output}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChart = () => (
  <div className="terminal-card p-4 space-y-3">
    <h2 className="font-mono text-sm font-bold">Org Chart</h2>
    <div className="font-mono text-[11px] leading-relaxed text-foreground/90 space-y-1">
      <div className="text-primary">Dave (David Noyes)</div>
      <div className="pl-3">└─ AI Unicorn / AI Lovable (orchestrator)</div>
      <div className="pl-9">├─ <span className="text-primary">Civilian</span> — Unicorn AI Builder</div>
      <div className="pl-14">├─ Corporations · Flagships · Brands</div>
      <div className="pl-14">├─ Products (Personal Pod — civilian variants)</div>
      <div className="pl-14">└─ Poke-Pulse (consumer fintech / TCG terminal)</div>
      <div className="pl-9">└─ <span className="text-destructive">Federal</span> — Empire Defense Dept <Lock className="w-3 h-3 inline text-destructive" /></div>
      <div className="pl-14 text-destructive/90">├─ Delta Pod (Federal Personal Pod variant)</div>
      <div className="pl-14 text-destructive/90">└─ Empire Defense — Owner-Only · TOP SECRET</div>
    </div>
    <p className="font-mono text-[9px] text-muted-foreground">
      Empire/Federal will eventually spin out of Unicorn AI Builder into a standalone project.
      Until then, all Federal/Delta Pod material is gated to Dave only.
    </p>
  </div>
);

const Moats = () => (
  <div className="terminal-card p-4 space-y-2">
    <h2 className="font-mono text-sm font-bold">Active Moats</h2>
    <ul className="font-mono text-[11px] space-y-1.5 text-foreground/90">
      <li>1. <b>Data moat</b> — proprietary 5-source consensus pricing + daily snapshots; deeper history each day.</li>
      <li>2. <b>IP moat</b> — patent-pending methodology, trademark on Poké-Pulse, trade secrets under 18 U.S.C. § 1832.</li>
      <li>3. <b>Brand moat</b> — terminal aesthetic, "Poké" naming, certified data partner positioning.</li>
      <li>4. <b>Distribution moat</b> — multi-platform autopost (Buffer + n8n), affiliate network, SEO content engine.</li>
      <li>5. <b>Tech moat</b> — multi-region replica, edge-function fleet, swarm-of-agents orchestration.</li>
      <li>6. <b>Legal moat</b> — DMCA / CFAA / DTSA notices, copy-protection, watermarking, ToS anti-scraping.</li>
      <li>7. <b>Compliance moat</b> — RLS zero-trust, SECURITY DEFINER RPCs, owner-only Federal channels.</li>
    </ul>
  </div>
);

export default function Boardroom() {
  useEffect(() => {
    document.title = "Boardroom — PGVA Ventures";
    let m = document.querySelector('meta[name="robots"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "robots"); document.head.appendChild(m); }
    m.setAttribute("content", "noindex,nofollow");
  }, []);
  return (
    <OwnerOnlyGate label="BOARDROOM · CLASSIFIED">
      <div className="min-h-screen bg-background pb-16">
        <TerminalHeader />
        <main className="max-w-6xl mx-auto px-3 py-4 space-y-4">
          <header className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <h1 className="font-mono text-base font-bold">Boardroom — Dave / PGVA Ventures, LLC</h1>
            <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-destructive border border-destructive/40 px-1.5 py-0.5 rounded">
              Owner-Only · Top Secret Channels Active
            </span>
          </header>

          <OrgChart />

          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-sm font-bold">Swarm Dispatcher</h2>
              <span className="ml-auto font-mono text-[9px] text-muted-foreground">
                A swarm = many specialist AI agents acting in parallel on one mission, then merging results.
              </span>
            </div>
            <Swarm />
          </div>

          <PassiveIncomePlaybook />

          <Moats />
          <FinancialDisclaimer />
        </main>
        <CopyrightBanner />
      </div>
    </OwnerOnlyGate>
  );
}
