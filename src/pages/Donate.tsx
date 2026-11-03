import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Building2, Globe, Users, Shield, ExternalLink, Gift, Landmark, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import TerminalHeader from "@/components/TerminalHeader";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const GOAL = 50_000_000;
const RAISED = 127_500;

const milestones = [
  { amount: 100_000, label: "Feasibility Study", reached: true },
  { amount: 500_000, label: "Land Acquisition Fund", reached: false },
  { amount: 2_000_000, label: "Architectural Design", reached: false },
  { amount: 10_000_000, label: "Construction Phase 1", reached: false },
  { amount: 25_000_000, label: "Collection Acquisition", reached: false },
  { amount: 50_000_000, label: "Grand Opening Endowment", reached: false },
];

const agentArmy = [
  { name: "Grant Scout Agent", desc: "Continuously scans federal, state, and private grant databases for museum and cultural institution funding opportunities.", status: "Active" },
  { name: "Corporate Partner Agent", desc: "Identifies and researches Fortune 500 companies with collectibles, gaming, or cultural philanthropy programs.", status: "Active" },
  { name: "Foundation Match Agent", desc: "Cross-references museum mission with 50,000+ private foundation databases to find aligned donors.", status: "Active" },
  { name: "Government Liaison Agent", desc: "Monitors Smithsonian partnerships, NEA grants, and congressional appropriations for museum funding.", status: "Scanning" },
  { name: "Celebrity Ambassador Agent", desc: "Identifies public figures who collect trading cards and could serve as museum ambassadors.", status: "Scanning" },
  { name: "Media Outreach Agent", desc: "Generates press coverage opportunities and viral social media campaigns for the museum initiative.", status: "Active" },
];

const Donate = () => {
  const navigate = useNavigate();
  const pct = Math.min((RAISED / GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <TerminalHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <button onClick={() => navigate("/")}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </button>

        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px]">
            <Landmark className="w-3 h-3 mr-1" /> TIER 5 — PULSE PHILANTHROPIC PROJECT™
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            National Museum of Trading Cards<br />& Collectibles
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Washington, D.C. — Free to the public, forever.
            Help us build the world's first museum dedicated to preserving and celebrating
            the art, history, and culture of trading cards and collectibles.
          </p>
        </motion.section>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border/60">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold font-mono text-primary">${RAISED.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">raised of ${(GOAL / 1_000_000).toFixed(0)}M goal</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-mono">{pct.toFixed(2)}%</p>
                  <p className="text-[10px] text-muted-foreground font-mono">funded</p>
                </div>
              </div>
              <Progress value={pct} className="h-3" />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {milestones.map(m => (
                  <div key={m.label} className={`p-2 rounded border text-center ${m.reached ? "border-primary/40 bg-primary/5" : "border-border/40"}`}>
                    <p className="font-mono text-[10px] font-bold">${m.amount >= 1_000_000 ? `${m.amount / 1_000_000}M` : `${m.amount / 1_000}K`}</p>
                    <p className="text-[8px] text-muted-foreground">{m.label}</p>
                    {m.reached && <Badge className="mt-1 text-[7px] bg-primary/20 text-primary">✓ Reached</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Donate Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border/60">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">Make a Donation</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Every dollar goes directly toward building the National Museum.
                No tax deduction is promised. Contact us about current contribution terms.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[25, 100, 500, 1000, 5000, 10000].map(amt => (
                  <Button key={amt} variant="outline" size="sm"
                    className="font-mono text-xs border-primary/30 hover:bg-primary/10">
                    ${amt >= 1000 ? `${amt / 1000}K` : amt}
                  </Button>
                ))}
              </div>
              <Button className="w-full font-mono text-sm bg-primary text-primary-foreground">
                <Heart className="w-4 h-4 mr-2" /> Donate Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">Donate Collections</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Have trading cards or collectibles you'd like preserved in the museum?
                We accept physical and digital collection donations for permanent exhibition.
              </p>
              <div className="space-y-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2"><Star className="w-3 h-3 text-primary" /> Poké TCG collections</div>
                <div className="flex items-center gap-2"><Star className="w-3 h-3 text-primary" /> Sports memorabilia</div>
                <div className="flex items-center gap-2"><Star className="w-3 h-3 text-primary" /> Vintage & rare card sets</div>
                <div className="flex items-center gap-2"><Star className="w-3 h-3 text-primary" /> Digital NFT collections</div>
              </div>
              <Button variant="outline" className="w-full font-mono text-sm">
                <Gift className="w-4 h-4 mr-2" /> Inquire About Donating
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Agent Army */}
        <section className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 text-[10px] font-mono border-primary/30 text-primary">
              <Users className="w-3 h-3 mr-1" /> AGENT ARMY — AUTONOMOUS FUNDING DISCOVERY
            </Badge>
            <h2 className="text-xl font-bold">Philanthropic Agent Army</h2>
            <p className="text-xs text-muted-foreground mt-1">
              AI-powered agents continuously scanning for funding, partnerships, and opportunities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentArmy.map(a => (
              <Card key={a.name} className="bg-card border-border/40">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs">{a.name}</p>
                    <Badge variant="outline" className={`text-[8px] font-mono ${a.status === "Active" ? "border-primary/40 text-primary" : "border-muted-foreground/30"}`}>
                      {a.status === "Active" ? "🟢" : "🔵"} {a.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why This Museum */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-center">Why This Museum Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Building2, title: "Cultural Preservation", desc: "Trading cards represent a $50B+ cultural phenomenon spanning 90+ years. This art form deserves institutional preservation." },
              { icon: Globe, title: "Free Forever", desc: "Modeled after the Smithsonian — no admission fee, ever. Accessible to every family, student, and collector regardless of income." },
              { icon: Shield, title: "Legacy Protection", desc: "Our long-term goal is accessible preservation of trading-card history." },
            ].map(c => (
              <Card key={c.title} className="bg-card border-border/40">
                <CardContent className="p-4 space-y-2 text-center">
                  <c.icon className="w-8 h-8 text-primary mx-auto" />
                  <p className="font-bold text-sm">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <Card className="bg-muted/20 border-border/40">
          <CardContent className="p-5 text-center space-y-2">
            <p className="font-bold text-sm">Questions about the museum or large donations?</p>
            <p className="text-[10px] text-muted-foreground">
              Contact David Noyes — <a href="mailto:contact@poke-pulse-ticker.com" className="text-primary hover:underline">contact@poke-pulse-ticker.com</a> | <a href="mailto:pokegarageva@gmail.com" className="text-primary hover:underline">pokegarageva@gmail.com</a>
            </p>
          </CardContent>
        </Card>

        <p className="text-[8px] text-muted-foreground text-center font-mono">
          © 2026 PGVA Ventures, LLC All donations managed under 501(c)(3) application.
          Pulse Philanthropic Project™ is a trademark of PGVA Ventures, LLC.
        </p>
        <FinancialDisclaimer compact />
      </main>
    </div>
  );
};

export default Donate;
