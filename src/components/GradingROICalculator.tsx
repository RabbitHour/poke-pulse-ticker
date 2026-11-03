import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Gem, BarChart3, Search } from "lucide-react";
import type { CardData } from "@/data/marketData";

interface GradingROIProps {
  cards: CardData[];
}

const GRADING_COSTS: Record<string, { cost: number; turnaround: string }> = {
  "PSA Economy": { cost: 20, turnaround: "150+ days" },
  "PSA Regular": { cost: 50, turnaround: "65 business days" },
  "PSA Express": { cost: 100, turnaround: "15 business days" },
  "PSA Super Exp.": { cost: 200, turnaround: "5 business days" },
  "CGC Standard": { cost: 18, turnaround: "120+ days" },
  "CGC Express": { cost: 50, turnaround: "10 business days" },
  "BGS Standard": { cost: 25, turnaround: "90+ days" },
  "BGS Express": { cost: 150, turnaround: "10 business days" },
  "TAG Standard": { cost: 15, turnaround: "60+ days" },
  "ACE Economy": { cost: 12, turnaround: "90+ days" },
};

const GRADE_MULTIPLIERS: Record<string, number> = {
  "10": 4.2,
  "9.5": 2.8,
  "9": 2.0,
  "8.5": 1.4,
  "8": 1.15,
};

const DISPLAY_LIMIT = 50;

const GradingROICalculator = ({ cards }: GradingROIProps) => {
  const [selectedCard, setSelectedCard] = useState(0);
  const [gradingService, setGradingService] = useState("PSA Economy");
  const [expectedGrade, setExpectedGrade] = useState("10");
  const [searchFilter, setSearchFilter] = useState("");

  const pool = useMemo(() => {
    return cards
      .filter((c) => c.market >= 5)
      .sort((a, b) => b.market - a.market);
  }, [cards]);

  const filteredPool = useMemo(() => {
    if (!searchFilter.trim()) return pool.slice(0, DISPLAY_LIMIT);
    const q = searchFilter.toLowerCase();
    return pool
      .filter((c) => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q))
      .slice(0, DISPLAY_LIMIT);
  }, [pool, searchFilter]);

  const card = pool[selectedCard] || pool[0];
  const service = GRADING_COSTS[gradingService];
  const multiplier = GRADE_MULTIPLIERS[expectedGrade] || 1;

  const rawValue = card?.market || 0;
  const gradedValue = rawValue * multiplier;
  const totalCost = rawValue + service.cost;
  const profit = gradedValue - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const isProfit = profit > 0;

  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5 }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border/60 px-4 py-3 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-terminal-amber" />
        <h2 className="text-sm font-bold tracking-wide text-secondary uppercase">
          Grading ROI Calculator
        </h2>
        <span className="ml-auto font-mono text-[9px] bg-terminal-amber/15 text-terminal-amber px-2 py-0.5 rounded-full font-bold">
          {pool.length.toLocaleString()}+ CARDS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-3 items-start">
            <div className="flex items-center gap-3">
              {card._image && (
                <div className="w-16 h-24 rounded overflow-hidden ring-1 ring-border bg-muted flex-shrink-0">
                  <img
                    src={card._image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-foreground truncate">
                  {card.name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  {card.set}
                </p>
                <p className="font-mono text-xs font-semibold text-foreground mt-1">
                  Raw: ${rawValue.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block">
                Search Card ({pool.length.toLocaleString()} available)
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by name or set..."
                  className="w-full bg-muted/50 border border-border rounded px-3 py-1.5 pl-7 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
              <select
                value={selectedCard}
                onChange={(e) => {
                  setSelectedCard(Number(e.target.value));
                  setSearchFilter("");
                }}
                className="w-full bg-muted/50 border border-border rounded px-3 py-2 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none transition-colors max-h-48"
                size={1}
              >
                {filteredPool.map((c) => {
                  const idx = pool.indexOf(c);
                  return (
                    <option key={idx} value={idx}>
                      {c.name} — {c.set} — ${c.market.toFixed(2)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
              Grading Service
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {Object.entries(GRADING_COSTS).map(([name, info]) => (
                <button
                  key={name}
                  onClick={() => setGradingService(name)}
                  className={`px-2 py-1.5 rounded font-mono text-[10px] border transition-all ${
                    gradingService === name
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {name} · ${info.cost}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
              Expected Grade
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(GRADE_MULTIPLIERS).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setExpectedGrade(grade)}
                  className={`px-2 py-2 rounded font-mono text-xs font-bold border transition-all ${
                    expectedGrade === grade
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 rounded p-2.5">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Raw Value</p>
              <p className="font-mono text-sm font-bold text-foreground">${rawValue.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2.5">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Grading Cost</p>
              <p className="font-mono text-sm font-bold text-terminal-amber">${service.cost}</p>
            </div>
            <div className="bg-muted/30 rounded p-2.5">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Est. Graded Value</p>
              <p className="font-mono text-sm font-bold text-foreground">${gradedValue.toFixed(2)}</p>
            </div>
            <div className={`rounded p-2.5 ${isProfit ? "bg-primary/10" : "bg-destructive/10"}`}>
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Profit / ROI</p>
              <p className={`font-mono text-sm font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
                {isProfit ? "+" : ""}${profit.toFixed(2)}
                <span className="text-[10px] ml-1">({roi.toFixed(0)}%)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Gem className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="font-mono text-[10px] text-muted-foreground">
              Turnaround:{" "}
              <span className="text-foreground font-semibold">{service.turnaround}</span>
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              isProfit
                ? "border-primary/30 bg-primary/5"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-primary" />
            ) : (
              <BarChart3 className="w-4 h-4 text-destructive" />
            )}
            <p className={`font-mono text-xs font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
              {isProfit
                ? `Grade it! Potential ${roi.toFixed(0)}% return`
                : "Not worth grading at this service level"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GradingROICalculator;
