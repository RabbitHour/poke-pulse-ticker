import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Layers, DollarSign, X, ArrowUpRight, Filter } from "lucide-react";
import type { CardData } from "@/data/marketData";

interface SetPerf {
  set: string;
  avgChange: number;
  totalValue: number;
  count: number;
  topCard: string | null;
  topCardPrice: number;
  medianPrice: number;
  highPrice: number;
  lowPrice: number;
  volatility: number;
  gainers: number;
  losers: number;
}

interface SetHeatmapProps {
  cards: CardData[];
}

type FilterMode = "all" | "gainers" | "losers" | "hot";
const LANDING_LIMIT = 20;
const EXPANDED_LIMIT = 60;

const FILTER_LABEL: Record<FilterMode, string> = {
  all: "All",
  gainers: "Gainers ▲",
  losers: "Losers ▼",
  hot: "Volatile ⚡",
};

const SetHeatmap = ({ cards }: SetHeatmapProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedSet, setSelectedSet] = useState<SetPerf | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  const allSets = useMemo(() => {
    const map = new Map<string, { total: number; change: number; count: number; prices: number[]; changes: number[]; topCard: string | null; topCardPrice: number }>();
    for (const c of cards) {
      const entry = map.get(c.set) || { total: 0, change: 0, count: 0, prices: [], changes: [], topCard: null, topCardPrice: 0 };
      entry.total += c.market;
      entry.change += c.change;
      entry.count += 1;
      entry.prices.push(c.market);
      entry.changes.push(c.change);
      if (c.market > entry.topCardPrice) {
        entry.topCard = c.name;
        entry.topCardPrice = c.market;
      }
      map.set(c.set, entry);
    }
    return Array.from(map.entries())
      .filter(([, d]) => d.count >= 2)
      .map(([set, data]) => {
        const sorted = [...data.prices].sort((a, b) => a - b);
        const med = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const mean = data.change / data.count;
        const variance = data.changes.reduce((s, c) => s + (c - mean) ** 2, 0) / data.count;
        return {
          set,
          avgChange: mean,
          totalValue: data.total,
          count: data.count,
          topCard: data.topCard,
          topCardPrice: data.topCardPrice,
          medianPrice: med,
          highPrice: sorted[sorted.length - 1],
          lowPrice: sorted[0],
          volatility: Math.sqrt(variance),
          gainers: data.changes.filter((c) => c > 0).length,
          losers: data.changes.filter((c) => c < 0).length,
        } as SetPerf;
      })
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [cards]);

  const filteredSets = useMemo(() => {
    switch (filter) {
      case "gainers": return allSets.filter(s => s.avgChange > 0).sort((a, b) => b.avgChange - a.avgChange);
      case "losers":  return allSets.filter(s => s.avgChange < 0).sort((a, b) => a.avgChange - b.avgChange);
      case "hot":     return [...allSets].sort((a, b) => b.volatility - a.volatility);
      default:        return allSets;
    }
  }, [allSets, filter]);

  const limit = expanded ? EXPANDED_LIMIT : LANDING_LIMIT;
  const setPerformance = filteredSets.slice(0, limit);
  const maxVal = Math.max(...setPerformance.map((s) => s.totalValue), 1);

  const getColor = (change: number) => {
    if (change > 3) return "bg-emerald-800 text-white";
    if (change > 0) return "bg-emerald-200 text-emerald-950";
    if (change === 0) return "bg-slate-200 text-slate-950";
    if (change > -3) return "bg-rose-200 text-rose-950";
    return "bg-rose-800 text-white";
  };

  const getBorderColor = (change: number) => {
    if (change > 1) return "border-emerald-500/30";
    if (change < -1) return "border-red-500/30";
    return "border-border/40";
  };

  const formatValue = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(0)}`;

  const setSlug = (s: string) => encodeURIComponent(s);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      aria-labelledby="set-heatmap-title"
    >
      <div className="terminal-card overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <h3 id="set-heatmap-title" className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Set Performance Heatmap
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
              S&P 500 STYLE
            </span>
            <span className="font-mono text-[8px] text-primary">
              {filteredSets.length} / {allSets.length} SETS
            </span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="border-b border-border/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto" role="toolbar" aria-label="Heatmap filters">
          <Filter className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
          {(Object.keys(FILTER_LABEL) as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setFilter(mode); setSelectedSet(null); }}
              aria-pressed={filter === mode}
              className={`font-mono text-[9px] px-2 py-1 rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                filter === mode
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {FILTER_LABEL[mode]}
            </button>
          ))}
        </div>

        {/* Heatmap grid */}
        <div
          className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          role="grid"
          aria-label={`${setPerformance.length} sets shown, sized by total market value`}
        >
          {setPerformance.map((s) => {
            const sizeRatio = Math.max(0.5, s.totalValue / maxVal);
            const isSelected = selectedSet?.set === s.set;
            return (
              <button
                key={s.set}
                onClick={() => setSelectedSet(isSelected ? null : s)}
                aria-pressed={isSelected}
                aria-label={`${s.set}, ${s.avgChange >= 0 ? "up" : "down"} ${Math.abs(s.avgChange).toFixed(1)} percent, ${formatValue(s.totalValue)} total value, ${s.count} cards`}
                className={`rounded-md border ${getBorderColor(s.avgChange)} p-1.5 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-lg hover:z-10 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:z-20 ${getColor(s.avgChange)} ${isSelected ? "ring-1 ring-primary scale-105" : ""}`}
                style={{ minHeight: `${100 + sizeRatio * 28}px` }}
              >
                <span className="font-mono text-sm font-bold leading-snug whitespace-normal w-full">
                  {s.set}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] font-black">
                  {s.avgChange >= 0 ? "+" : ""}{s.avgChange.toFixed(1)}%
                </span>
                <span className="font-mono text-sm font-semibold">
                  {formatValue(s.totalValue)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected set detail panel */}
        <AnimatePresence>
          {selectedSet && (
            <motion.div
              key={selectedSet.set}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-primary" />
                      {selectedSet.set}
                    </h4>
                    <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                      {selectedSet.count} cards tracked · Tap another set to compare
                    </p>
                  </div>
                  <button onClick={() => setSelectedSet(null)} className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Close set details">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase">Total Value</p>
                    <p className="font-mono text-sm font-black text-foreground">{formatValue(selectedSet.totalValue)}</p>
                  </div>
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase">Avg Change</p>
                    <p className={`font-mono text-sm font-black ${selectedSet.avgChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {selectedSet.avgChange >= 0 ? "+" : ""}{selectedSet.avgChange.toFixed(2)}%
                    </p>
                  </div>
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase">Median Price</p>
                    <p className="font-mono text-sm font-black text-foreground">${selectedSet.medianPrice.toFixed(2)}</p>
                  </div>
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase">Volatility</p>
                    <p className="font-mono text-sm font-black text-amber-400">{selectedSet.volatility.toFixed(1)}σ</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" /> High
                    </p>
                    <p className="font-mono text-xs font-bold text-foreground">{formatValue(selectedSet.highPrice)}</p>
                  </div>
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" /> Low
                    </p>
                    <p className="font-mono text-xs font-bold text-foreground">{formatValue(selectedSet.lowPrice)}</p>
                  </div>
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> Gainers
                    </p>
                    <p className="font-mono text-xs font-bold text-emerald-400">{selectedSet.gainers}</p>
                  </div>
                  <div className="terminal-card p-2">
                    <p className="font-mono text-[7px] text-muted-foreground uppercase flex items-center gap-1">
                      <TrendingDown className="w-2.5 h-2.5 text-red-400" /> Losers
                    </p>
                    <p className="font-mono text-xs font-bold text-red-400">{selectedSet.losers}</p>
                  </div>
                </div>

                {selectedSet.topCard && (
                  <div className="mt-2 terminal-card p-2 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[7px] text-muted-foreground uppercase">Top Card</p>
                      <p className="font-mono text-[10px] font-bold text-foreground">{selectedSet.topCard}</p>
                    </div>
                    <p className="font-mono text-xs font-black text-primary">{formatValue(selectedSet.topCardPrice)}</p>
                  </div>
                )}

                {/* Mini distribution bar */}
                <div className="mt-2.5">
                  <p className="font-mono text-[7px] text-muted-foreground uppercase mb-1">Price Distribution</p>
                  <div className="flex gap-0.5 h-3 rounded overflow-hidden">
                    {selectedSet.count > 0 && (
                      <>
                        <div
                          className="bg-emerald-500/60 rounded-l"
                          style={{ width: `${(selectedSet.gainers / selectedSet.count) * 100}%` }}
                          title={`${selectedSet.gainers} gainers`}
                        />
                        <div
                          className="bg-muted"
                          style={{ width: `${((selectedSet.count - selectedSet.gainers - selectedSet.losers) / selectedSet.count) * 100}%` }}
                          title="Flat"
                        />
                        <div
                          className="bg-red-500/60 rounded-r"
                          style={{ width: `${(selectedSet.losers / selectedSet.count) * 100}%` }}
                          title={`${selectedSet.losers} losers`}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Click-through CTA */}
                <Link
                  to={`/set-browser?set=${setSlug(selectedSet.set)}`}
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-primary hover:text-primary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                >
                  Explore all {selectedSet.count} cards in {selectedSet.set}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="border-t border-border px-4 py-1.5 flex items-center justify-between">
          <span className="font-mono text-[8px] text-muted-foreground">
            Size = value · Color = avg Δ% · {setPerformance.length}/{filteredSets.length} sets shown
          </span>
          <div className="flex items-center gap-2">
            {filteredSets.length > LANDING_LIMIT && (
              <button
                onClick={() => { setExpanded(!expanded); setSelectedSet(null); }}
                className="font-mono text-[9px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
              >
                {expanded ? (
                  <>Show Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Show All {filteredSets.length} <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
            <span className="font-mono text-[8px] text-primary">PGVA Verified™</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SetHeatmap;
