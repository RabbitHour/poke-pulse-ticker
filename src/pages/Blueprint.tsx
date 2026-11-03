import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import {
  TrendingUp, Globe, Shield, Zap, BarChart3, Users, Trophy, Gamepad2,
  Target, DollarSign, Layers, ArrowRight, Rocket, Lock, Brain, Play,
  ChevronRight, Activity, Database, Cpu, Eye, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";

/* ─── data ─── */
const terminals = [
  { name: "Poké TCG", slug: "/", status: "live", tam: 15.4, emoji: "⚡", color: "hsl(48, 96%, 53%)" },
  { name: "Magic: The Gathering", slug: "/demo/mtg", status: "demo", tam: 8.2, emoji: "🧙", color: "hsl(263, 90%, 51%)" },
  { name: "Yu-Gi-Oh!", slug: "/demo/yugioh", status: "demo", tam: 5.1, emoji: "🃏", color: "hsl(0, 84%, 60%)" },
  { name: "MLB", slug: "/demo/mlb", status: "demo", tam: 12.6, emoji: "⚾", color: "hsl(0, 72%, 51%)" },
  { name: "NFL", slug: "/demo/nfl", status: "demo", tam: 18.3, emoji: "🏈", color: "hsl(142, 71%, 45%)" },
  { name: "NBA", slug: "/demo/nba", status: "demo", tam: 14.7, emoji: "🏀", color: "hsl(25, 95%, 53%)" },
  { name: "NHL", slug: "/demo/nhl", status: "demo", tam: 4.2, emoji: "🏒", color: "hsl(217, 91%, 60%)" },
  { name: "DragonBall Z", slug: "/demo/dbz", status: "demo", tam: 6.8, emoji: "🐉", color: "hsl(38, 92%, 50%)" },
  { name: "Lorcana", slug: "/demo/lorcana", status: "demo", tam: 1.8, emoji: "✨", color: "hsl(199, 89%, 48%)" },
  { name: "Star Wars", slug: "/demo/starwars", status: "demo", tam: 9.5, emoji: "⭐", color: "hsl(220, 9%, 46%)" },
  { name: "FIFA Soccer", slug: "/demo/fifa", status: "demo", tam: 7.3, emoji: "⚽", color: "hsl(160, 84%, 39%)" },
];

const totalTAM = terminals.reduce((s, t) => s + t.tam, 0);

const coreFeatures = [
  { icon: BarChart3, name: "Real-Time Indexes", desc: "RAW 500, GRADED 1000, SEALED 1000 — live market heartbeat refreshed every 60 min" },
  { icon: Brain, name: "AI Alpha Signals", desc: "Machine-learning buy/sell/hold indicators with RSI/SMA overlays and confidence scoring" },
  { icon: TrendingUp, name: "Portfolio Tracker", desc: "Real-time P&L, cost-basis tracking, daily snapshots, and capital-gains tax reports" },
  { icon: Gamepad2, name: "SimTrader World™", desc: "$100K virtual portfolio, 10 AI bots, limit/stop orders, and PvP trading contests" },
  { icon: Trophy, name: "Arena™ Wagering", desc: "Price prediction markets, 1v1 duels, and tournament brackets — all on PokéCoins" },
  { icon: Users, name: "Community Intel", desc: "Consensus pricing, crowd sentiment polls, verified leaderboards, and whale reports" },
  { icon: Database, name: "Data API", desc: "Institutional-grade REST endpoints for bulk price, index, and signal data licensing" },
  { icon: Eye, name: "Arbitrage & Alerts", desc: "Cross-marketplace arbitrage scanner, grading ROI calculator, and delta price alerts" },
];

const revenueStreams = [
  { name: "Subscriptions", pct: 45, color: "hsl(var(--primary))" },
  { name: "Games", pct: 15, color: "hsl(48, 96%, 53%)" },
  { name: "Affiliate", pct: 12, color: "hsl(25, 95%, 53%)" },
  { name: "Data API", pct: 10, color: "hsl(199, 89%, 48%)" },
  { name: "Arena Rake", pct: 8, color: "hsl(263, 90%, 51%)" },
  { name: "Ads", pct: 5, color: "hsl(330, 81%, 60%)" },
  { name: "White-Label", pct: 5, color: "hsl(142, 71%, 45%)" },
];

const projections = [
  { year: "2026", arr: 2.1, users: 50, terminals: 3, margin: 22 },
  { year: "2027", arr: 8.5, users: 250, terminals: 7, margin: 35 },
  { year: "2028", arr: 25, users: 1000, terminals: 12, margin: 45 },
  { year: "2029", arr: 75, users: 3000, terminals: 12, margin: 55 },
];

const growthChart = [
  { m: "Q1'26", v: 0.5 }, { m: "Q2'26", v: 1.1 }, { m: "Q3'26", v: 1.6 }, { m: "Q4'26", v: 2.1 },
  { m: "Q1'27", v: 3.2 }, { m: "Q2'27", v: 4.8 }, { m: "Q3'27", v: 6.5 }, { m: "Q4'27", v: 8.5 },
  { m: "Q1'28", v: 12 }, { m: "Q2'28", v: 16 }, { m: "Q3'28", v: 20 }, { m: "Q4'28", v: 25 },
  { m: "Q1'29", v: 35 }, { m: "Q2'29", v: 48 }, { m: "Q3'29", v: 62 }, { m: "Q4'29", v: 75 },
];

/* ─── Live Terminal Simulator ─── */
const TerminalSimulator = () => {
  const [active, setActive] = useState(0);
  const [prices, setPrices] = useState<number[]>([100, 102, 101, 104, 103, 106, 108, 107, 110, 112]);

  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => {
        const last = prev[prev.length - 1];
        const next = [...prev.slice(1), last + (Math.random() - 0.45) * 3];
        return next;
      });
    }, 1500);
    return () => clearInterval(iv);
  }, [active]);

  const t = terminals[active];
  const chartData = prices.map((v, i) => ({ t: i, v }));
  const change = ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2);
  const isUp = Number(change) >= 0;

  return (
    <Card className="bg-card/80 border-border/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
        <Activity className="w-4 h-4 text-primary animate-pulse" />
        <span className="font-mono text-xs font-bold text-foreground">LIVE TERMINAL ENGINE</span>
        <Badge variant="outline" className="ml-auto text-[9px] font-mono border-primary/40 text-primary">
          INTERACTIVE DEMO
        </Badge>
      </div>

      {/* Terminal selector */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/30">
        {terminals.map((term, i) => (
          <button key={term.name} onClick={() => setActive(i)}
            className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-mono transition-all ${
              i === active ? "bg-primary/20 text-primary border border-primary/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}>
            {term.emoji} {term.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{t.emoji}</span>
          <div>
            <p className="font-bold text-sm">{t.name} Personal Pulse Engine</p>
            <p className="text-[10px] text-muted-foreground font-mono">TAM: ${t.tam}B · Status: {t.status.toUpperCase()}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-mono font-bold text-lg" style={{ color: t.color }}>{prices[prices.length - 1].toFixed(2)}</p>
            <p className={`text-xs font-mono ${isUp ? "text-green-500" : "text-red-500"}`}>
              {isUp ? "▲" : "▼"} {change}%
            </p>
          </div>
        </div>

        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={t.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={t.color} fill="url(#simGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {["RAW Index", "GRADED Index", "SEALED Index"].map((idx, i) => (
            <div key={idx} className="text-center p-2 rounded bg-muted/30 border border-border/30">
              <p className="text-[9px] text-muted-foreground font-mono">{idx}</p>
              <p className="font-mono font-bold text-xs text-foreground">
                {(1000 + Math.sin(Date.now() / 10000 + i) * 50).toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── Animated Counter ─── */
const AnimCounter = ({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(target * eased);
      if (progress >= 1) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [target, duration]);
  return <span>{prefix}{Number.isInteger(target) ? Math.round(val).toLocaleString() : val.toFixed(1)}{suffix}</span>;
};

/* ─── Main Blueprint Page ─── */
const Blueprint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<number | null>(null);

  // Copy protection
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === "F12" || (e.ctrlKey && ["s","u","p","c","a"].includes(e.key.toLowerCase())) || (e.ctrlKey && e.shiftKey && ["i","j"].includes(e.key.toLowerCase()))) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("dragstart", prevent);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("dragstart", prevent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Forensic watermark */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='60'%3E%3Ctext x='10' y='30' fill='%23fff' font-size='10' font-family='monospace' transform='rotate(-15)'%3E© 2026 PGVA Ventures LLC · Patent Pending%3C/text%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }} />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(48, 96%, 53%) 0%, transparent 40%)" }} />
        <div className="relative max-w-6xl mx-auto text-center space-y-5">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge variant="outline" className="mb-4 border-primary/40 text-primary font-mono text-[10px]">
              <Lock className="w-3 h-3 mr-1" /> CONFIDENTIAL — INVESTOR BLUEPRINT
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              5-TIER VERTICAL<br />INTEGRATION™
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              A patent-pending ecosystem that pinpoints collectible price points across 12 verticals,
              predicts their futures with AI-driven signals, and deploys automated strategies to
              generate revenue — from garage-scale trading to museum-grade philanthropy.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center">
            {[
              { icon: Globe, text: "5 Tiers" },
              { icon: DollarSign, text: `$${totalTAM.toFixed(0)}B+ TAM` },
              { icon: Shield, text: "Patent Pending" },
              { icon: Cpu, text: "AI-Powered" },
            ].map(b => (
              <Badge key={b.text} className="bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] py-1">
                <b.icon className="w-3 h-3 mr-1" /> {b.text}
              </Badge>
            ))}
          </motion.div>

          {/* Hero metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mt-8">
            {[
              { value: 12, suffix: "", label: "TERMINALS", prefix: "" },
              { value: totalTAM, suffix: "B+", label: "COMBINED TAM", prefix: "$" },
              { value: 75, suffix: "M+", label: "2029 ARR", prefix: "$" },
              { value: 7, suffix: "", label: "REVENUE STREAMS", prefix: "" },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-lg bg-card/60 border border-border/40 text-center">
                <p className="text-xl md:text-2xl font-bold font-mono text-primary">
                  <AnimCounter target={m.value} prefix={m.prefix} suffix={m.suffix} />
                </p>
                <p className="text-[8px] text-muted-foreground font-mono tracking-wider mt-1">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 5-TIER VERTICAL INTEGRATION ═══ */}
      <section className="py-12 px-4 border-t border-border/40 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3 text-xs font-mono tracking-widest border-primary/30 text-primary">
              PGVA VENTURES, LLC
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">5-Tier Vertical Integration™</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              From garage to museum — a complete ecosystem designed to run indefinitely
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                tier: "TIER 1", name: "PokéGarageVA™", icon: "🏠", color: "hsl(25, 95%, 53%)",
                desc: "The grassroots foundation. AI-guided sourcing tells you exactly which cards to buy below market, when to flip, and which to send to grading — turning any home into a profitable trading operation with vending machine distribution.",
                features: ["AI-powered buy-below-market sourcing", "Grading ROI profit alerts", "Vending machine revenue network", "Local community trading events"]
              },
              {
                tier: "TIER 2", name: "Poke-Pulse-Engine™", icon: "📊", color: "hsl(48, 96%, 53%)",
                desc: "The consumer data terminal. Pinpoints live market prices for 500+ cards, predicts price trajectories with AI Alpha Signals, and deploys arbitrage & grading strategies — so collectors always know what to buy, hold, or sell.",
                features: ["Live RAW/GRADED/SEALED indexes", "AI buy/sell/hold signals (78%+ accuracy)", "Cross-marketplace arbitrage scanner", "7-tier subscription revenue model"]
              },
              {
                tier: "TIER 3", name: "Personal Pulse Engine™", icon: "🏗️", color: "hsl(142, 71%, 45%)",
                desc: "Institutional-grade franchise licensing. The same data engine that powers Poké TCG is white-labeled across 12 multi-billion-dollar collectible verticals — MLB, NFL, NBA, MTG, Yu-Gi-Oh!, and more — each generating independent subscription and API revenue.",
                features: ["12-vertical franchise system ($103B+ TAM)", "White-label terminal deployments", "REST data API licensing ($0.01/call)", "Per-vertical subscription revenue"]
              },
              {
                tier: "TIER 4", name: "PGTV Media Hub™", icon: "📺", color: "hsl(0, 84%, 60%)",
                desc: "Full-scale branded media production. Poké Ripz™ digital pack-ripping shows, investor pitch videos, promotional campaigns, and creator network content — all monetized through ad revenue, sponsorships, and in-show betting.",
                features: ["Poké Ripz™ pack-ripping shows", "In-video betting with PokéCoins", "Multi-platform distribution", "Ad & sponsorship revenue"]
              },
              {
                tier: "TIER 5", name: "Pulse Philanthropic Project™", icon: "🏛️", color: "hsl(263, 90%, 51%)",
                desc: "The legacy tier. Building the National Museum of Trading Cards & Collectibles in Washington, D.C. — free to the public forever. Funded by platform revenue, government grants, and collector donations. The ultimate brand halo for investor and public trust.",
                features: ["National Museum of Trading Cards", "Free public admission forever", "Physical & digital collections", "Government & private funding"]
              },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}>
                <Card className="bg-card border-border/40 hover:border-primary/30 transition-all h-full">
                  <div className="h-1.5" style={{ background: t.color }} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <p className="text-[9px] font-mono text-muted-foreground tracking-widest">{t.tier}</p>
                        <p className="font-bold text-xs">{t.name}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
                    <div className="space-y-1">
                      {t.features.map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                          <div className="w-1 h-1 rounded-full" style={{ background: t.color }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LIVE TERMINAL ENGINE ═══ */}
      <section className="py-12 px-4 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Live Terminal Engine</h2>
            <p className="text-sm text-muted-foreground mt-1">
              See how the engine pinpoints card prices across marketplaces, predicts price trajectories, and surfaces actionable arbitrage strategies — all in real time
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TerminalSimulator />
            <div className="space-y-4">
              <Card className="bg-card/80 border-border/60">
                <CardContent className="p-4 space-y-3">
                  <p className="font-bold text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" /> Architecture Overview
                  </p>
                  <div className="space-y-2">
                     {[
                      { label: "Data Ingestion", desc: "Multi-marketplace price aggregation from TCGPlayer, eBay, and live APIs (60-min refresh cycles)", pct: 100 },
                      { label: "AI Signal Engine", desc: "ML-driven buy/sell/hold signals with RSI, SMA, volume divergence, and 78%+ accuracy", pct: 85 },
                      { label: "Profit Strategies", desc: "Cross-marketplace arbitrage, grading ROI, PSA 10 ratio bots, and delta price alerts", pct: 90 },
                      { label: "Gamification Layer", desc: "SimTrader World™, Arena wagering, Poké Ripz™ digital rips, and PvP tournaments", pct: 75 },
                    ].map(a => (
                      <div key={a.label}>
                        <div className="flex justify-between text-xs">
                          <span className="font-mono font-semibold">{a.label}</span>
                          <span className="text-muted-foreground">{a.pct}%</span>
                        </div>
                        <Progress value={a.pct} className="h-1.5 mt-1" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border/60">
                <CardContent className="p-4">
                  <p className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> IP Protection
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    {["Patent Pending", "Trade Secrets", "DRM Protected", "DMCA Compliant", "Forensic Watermarks", "Copy Protected"].map(ip => (
                      <div key={ip} className="flex items-center gap-1 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {ip}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8 CORE FEATURES ═══ */}
      <section className="py-12 px-4 bg-muted/20 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Replicable Core Platform</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Every terminal ships with these features on day one — pinpoint pricing, predictive signals, and profit-deployment tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {coreFeatures.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}>
                <Card className="bg-card/60 border-border/40 hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-4">
                    <f.icon className="w-6 h-6 text-primary mb-2" />
                    <p className="font-semibold text-xs">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 12 VERTICALS ═══ */}
      <section className="py-12 px-4 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">12-Vertical Expansion Map</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Each terminal targets a distinct multi-billion-dollar market</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {terminals.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 * i }} whileHover={{ scale: 1.03 }}
                onClick={() => navigate(t.slug)}
                className="cursor-pointer">
                <Card className="bg-card border-border/40 hover:border-primary/30 transition-all overflow-hidden h-full">
                  <div className="h-1" style={{ background: t.color }} />
                  <CardContent className="p-3 text-center">
                    <span className="text-2xl block mb-1">{t.emoji}</span>
                    <p className="font-bold text-xs">{t.name}</p>
                    <p className="font-mono text-primary text-sm font-bold mt-1">${t.tam}B</p>
                    <Badge variant={t.status === "live" ? "default" : "secondary"} className="text-[8px] font-mono mt-1">
                      {t.status === "live" ? "🟢 LIVE" : "🟣 DEMO"}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {/* White-label card */}
            <Card className="bg-card border-primary/20 overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardContent className="p-3 text-center">
                <span className="text-2xl block mb-1">🏗️</span>
                <p className="font-bold text-xs">White-Label</p>
                <p className="font-mono text-primary text-sm font-bold mt-1">∞</p>
                <Badge className="text-[8px] font-mono mt-1 bg-primary/20 text-primary border-primary/30">LICENSING</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ REVENUE MODEL ═══ */}
      <section className="py-12 px-4 bg-muted/20 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">7 Revenue Streams Per Terminal</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {revenueStreams.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold w-24 text-right text-muted-foreground">{s.name}</span>
                  <div className="flex-1 h-7 bg-muted/50 rounded overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 1, delay: 0.1 }}
                      className="h-full rounded flex items-center justify-end pr-2"
                      style={{ background: s.color }}>
                      <span className="text-[10px] font-mono font-bold text-white">{s.pct}%</span>
                    </motion.div>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground font-mono text-center mt-2">
                × 12 verticals = massive diversified revenue
              </p>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={260} height={260}>
                <PieChart>
                  <Pie data={revenueStreams} dataKey="pct" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                    paddingAngle={2} strokeWidth={0}>
                    {revenueStreams.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GROWTH TRAJECTORY ═══ */}
      <section className="py-12 px-4 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Growth Trajectory</h2>

          {/* ARR chart */}
          <div className="h-56 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChart}>
                <defs>
                  <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v}M`} />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#arrGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Projections table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {projections.map((p, i) => (
              <motion.div key={p.year} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}>
                <Card className="bg-card/80 border-border/40 text-center">
                  <CardContent className="p-4">
                    <p className="font-mono font-bold text-lg text-primary">{p.year}</p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-xl font-bold font-mono text-foreground">${p.arr}M{p.arr >= 25 ? "+" : ""}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">ARR</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono">{p.users >= 1000 ? `${(p.users/1000).toFixed(0)}M` : `${p.users}K`}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">USERS</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold font-mono text-primary">{p.margin}%</p>
                        <p className="text-[9px] text-muted-foreground font-mono">NET MARGIN</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INVESTOR DOCUMENTS ═══ */}
      <section className="py-16 px-4 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3 text-xs font-mono tracking-widest border-primary/30 text-primary">
              INVESTOR DOCUMENTS
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Due Diligence Package</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">
              {user
                ? "Downloadable reports, legal documents, and financial projections for investor review."
                : "Sign in to access confidential investor documents."}
            </p>
          </div>

          {!user ? (
            <div className="text-center py-12 space-y-4">
              <Lock className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                These documents are restricted to verified investors. Please sign in or create an account to access the Due Diligence Package.
              </p>
              <Button onClick={() => setShowAuthModal(true)} size="lg" className="gap-2">
                <Shield className="w-4 h-4" /> Sign In to Access Documents
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Investor Report 2026", desc: "Revenue projections, 5-year plan, ARR/user growth charts, use-of-funds", file: "/PGVA_Investor_Report_2026.pdf", icon: BarChart3, color: "text-primary" },
                { title: "Security & Legal IP", desc: "Patent, trademark, copyright, trade secret protections & compliance", file: "/PGVA_Security_Legal_IP_Protection.pdf", icon: Shield, color: "text-destructive" },
                { title: "Financial Projections", desc: "2026–2029 ARR forecasts, unit economics, break-even analysis", file: "/PGVA_Financial_Projections_2026_2029.pdf", icon: TrendingUp, color: "text-green-500" },
                { title: "LLC Operating Agreement", desc: "PGVA Ventures, LLC corporate governance & member rights", file: "/PGVA_Ventures_LLC_Operating_Agreement.pdf", icon: Layers, color: "text-blue-500" },
                                { title: "IP Assignment Agreement", desc: "Intellectual property assignment & protection terms", file: "/PGVA_IP_Assignment_Protection_Agreement.pdf", icon: Star, color: "text-purple-500" },
                { title: "Franchise Blueprint", desc: "12-vertical expansion strategy & market opportunity overview", file: "/Pulse_Market_Terminal_Franchise_Blueprint.pdf", icon: Globe, color: "text-cyan-500" },
              ].map(doc => (
                <Card key={doc.title} className="bg-card border-border/40 hover:border-primary/40 transition-all group">
                  <CardContent className="pt-5 pb-4 space-y-3">
                    <doc.icon className={`w-5 h-5 ${doc.color}`} />
                    <h3 className="text-sm font-semibold">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{doc.desc}</p>
                    <a href={doc.file} download className="inline-block">
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 group-hover:border-primary/60">
                        <ArrowRight className="w-3 h-3" /> Download PDF
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* ═══ INVESTMENT CTA ═══ */}
      <section className="py-16 px-4 bg-muted/20 border-t border-border/40">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Rocket className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold">$2.5M Series Seed</h2>
            <p className="text-muted-foreground mt-2">
              Target: <strong className="text-foreground">10x ROI</strong> within 36 months
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { v: "12", l: "TERMINALS" },
              { v: `$${totalTAM.toFixed(0)}B+`, l: "COMBINED TAM" },
              { v: "$75M+", l: "2029 ARR" },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-bold font-mono text-primary">{s.v}</p>
                <p className="text-[8px] text-muted-foreground font-mono tracking-widest mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Button size="lg" onClick={() => navigate("/contact")}>
              Contact PGVA Ventures <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/franchise")}>
              Full Franchise Details <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ LEGAL FOOTER ═══ */}
      <section className="py-8 px-4 border-t border-border/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <FinancialDisclaimer />
          <div className="text-center space-y-1">
            <p className="font-mono text-[10px] text-primary font-bold tracking-widest">PGVA VENTURES, LLC</p>
            <p className="font-mono text-[7px] text-muted-foreground/60 max-w-2xl mx-auto">
              © {new Date().getFullYear()} PGVA Ventures, LLC. All rights reserved. Patent pending.
              Protected under U.S. copyright, trademark, trade secret, and patent laws (DMCA, CFAA, DTSA).
              Personal Pulse Engine™, SimTrader World™, PokéArena™, and Alpha Signals™ are trademarks of PGVA Ventures, LLC.
              This document is confidential and intended solely for the named recipient. Unauthorized distribution is strictly prohibited.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blueprint;
