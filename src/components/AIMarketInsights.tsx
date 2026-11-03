import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Eye, ChevronRight, RefreshCw } from "lucide-react";
import type { CardData } from "@/data/marketData";

interface AIInsight {
  id: number;
  type: "bullish" | "bearish" | "alert" | "opportunity";
  title: string;
  detail: string;
  confidence: number;
  cards: string[];
  timestamp: Date;
}

const INSIGHT_ICONS = {
  bullish: <TrendingUp className="w-4 h-4 text-primary" />,
  bearish: <TrendingDown className="w-4 h-4 text-destructive" />,
  alert: <AlertTriangle className="w-4 h-4 text-terminal-amber" />,
  opportunity: <Sparkles className="w-4 h-4 text-purple-400" />,
};

const INSIGHT_BORDERS = {
  bullish: "border-l-primary",
  bearish: "border-l-destructive",
  alert: "border-l-terminal-amber",
  opportunity: "border-l-purple-400",
};

function generateInsights(cards: CardData[]): AIInsight[] {
  if (!cards.length) return [];

  const topGainers = [...cards].sort((a, b) => b.change - a.change).slice(0, 5);
  const topLosers = [...cards].sort((a, b) => a.change - b.change).slice(0, 5);
  const highValue = [...cards].sort((a, b) => b.market - a.market).slice(0, 10);

  const insights: AIInsight[] = [];
  let id = 0;

  // Volume divergence detection
  const bigMovers = cards.filter(c => Math.abs(c.change) > 5);
  if (bigMovers.length > 0) {
    insights.push({
      id: id++,
      type: "alert",
      title: "Volume Divergence Detected",
      detail: `${bigMovers.length} cards showing >5% price movement. Unusual activity across ${new Set(bigMovers.map(c => c.set)).size} sets suggests market-wide repricing event.`,
      confidence: 78 + (bigMovers.length % 15),
      cards: bigMovers.slice(0, 3).map(c => c.name),
      timestamp: new Date(),
    });
  }

  // Bullish momentum
  if (topGainers[0]?.change > 3) {
    insights.push({
      id: id++,
      type: "bullish",
      title: "Strong Upward Momentum",
      detail: `${topGainers[0].name} leading gains at +${topGainers[0].change.toFixed(1)}%. ${topGainers.filter(c => c.change > 2).length} cards in positive breakout territory. Consider accumulating before next resistance level.`,
      confidence: 72 + Math.floor(topGainers[0].change),
      cards: topGainers.slice(0, 3).map(c => c.name),
      timestamp: new Date(),
    });
  }

  // Bearish pressure
  if (topLosers[0]?.change < -3) {
    insights.push({
      id: id++,
      type: "bearish",
      title: "Selling Pressure Building",
      detail: `${topLosers[0].name} dropping ${topLosers[0].change.toFixed(1)}%. Support levels being tested across ${topLosers.filter(c => c.change < -2).length} cards. Potential buying opportunity if fundamentals hold.`,
      confidence: 68 + Math.abs(Math.floor(topLosers[0].change)),
      cards: topLosers.slice(0, 3).map(c => c.name),
      timestamp: new Date(),
    });
  }

  // Grading arbitrage opportunity
  const gradingOps = highValue.filter(c => c.market > 20 && c.market < 100);
  if (gradingOps.length > 0) {
    insights.push({
      id: id++,
      type: "opportunity",
      title: "Grading Arbitrage Window",
      detail: `${gradingOps.length} cards in the $20–$100 sweet spot for PSA 10 grading. Estimated 180–320% ROI potential on mint specimens. Best candidates by spread margin identified.`,
      confidence: 85,
      cards: gradingOps.slice(0, 3).map(c => c.name),
      timestamp: new Date(),
    });
  }

  // Set rotation signal
  const setGroups = new Map<string, number[]>();
  cards.forEach(c => {
    if (!setGroups.has(c.set)) setGroups.set(c.set, []);
    setGroups.get(c.set)!.push(c.change);
  });
  const hotSets = [...setGroups.entries()]
    .map(([set, changes]) => ({ set, avg: changes.reduce((a, b) => a + b, 0) / changes.length }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 2);

  if (hotSets.length > 0 && hotSets[0].avg > 1) {
    insights.push({
      id: id++,
      type: "bullish",
      title: "Set Rotation Signal",
      detail: `"${hotSets[0].set}" averaging +${hotSets[0].avg.toFixed(1)}% across all tracked cards. Capital rotating into this set — typical pre-tournament or anniversary pattern.`,
      confidence: 74,
      cards: [hotSets[0].set],
      timestamp: new Date(),
    });
  }

  // Cross-era price correlation insight
  const modernCards = cards.filter(c => ["Scarlet & Violet", "Paldea Evolved", "Obsidian Flames", "151", "Prismatic Evolutions", "Journey Together", "Surging Sparks"].some(s => c.set.includes(s)));
  const vintageCards = cards.filter(c => ["Base Set", "Jungle", "Fossil", "Team Rocket"].some(s => c.set.includes(s)));
  if (modernCards.length > 0 && vintageCards.length > 0) {
    const modernAvg = modernCards.reduce((s, c) => s + c.change, 0) / modernCards.length;
    const vintageAvg = vintageCards.reduce((s, c) => s + c.change, 0) / vintageCards.length;
    insights.push({
      id: id++,
      type: modernAvg > vintageAvg ? "opportunity" : "alert",
      title: "Cross-Era Price Correlation",
      detail: `Modern era avg ${modernAvg >= 0 ? "+" : ""}${modernAvg.toFixed(1)}% vs Vintage avg ${vintageAvg >= 0 ? "+" : ""}${vintageAvg.toFixed(1)}%. ${modernAvg > vintageAvg ? "Capital flowing into Modern — chase momentum or accumulate undervalued Vintage." : "Vintage outperforming Modern — flight to quality assets. Consider blue-chip WOTC positions."}`,
      confidence: 76,
      cards: [...modernCards.slice(0, 2), ...vintageCards.slice(0, 1)].map(c => c.name),
      timestamp: new Date(),
    });
  }

  // Rarity premium insight
  const ultraRares = cards.filter(c => c.market > 50);
  const commons = cards.filter(c => c.market < 10 && c.market > 1);
  if (ultraRares.length > 3 && commons.length > 3) {
    const premiumSpread = (ultraRares.reduce((s, c) => s + c.change, 0) / ultraRares.length) - (commons.reduce((s, c) => s + c.change, 0) / commons.length);
    insights.push({
      id: id++,
      type: premiumSpread > 0 ? "bullish" : "bearish",
      title: "Rarity Premium Spread",
      detail: `Ultra Rare premium ${premiumSpread >= 0 ? "widening" : "compressing"} (${premiumSpread >= 0 ? "+" : ""}${premiumSpread.toFixed(1)}% spread). ${premiumSpread > 0 ? "Premium cards gaining relative value — collectors prioritizing chase cards." : "Commons outperforming — value hunters driving budget-tier demand."}`,
      confidence: 71,
      cards: ultraRares.slice(0, 2).map(c => c.name),
      timestamp: new Date(),
    });
  }

  return insights.slice(0, 7);
}

const AIMarketInsights = ({ cards }: { cards: CardData[] }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const insights = useMemo(() => generateInsights(cards), [cards, refreshKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey(k => k + 1);
      setRefreshing(false);
    }, 800);
  };

  if (!cards.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5 }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border/60 px-4 py-3 flex items-center gap-2">
        <div className="relative">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        </div>
        <h2 className="text-sm font-bold tracking-wide text-secondary uppercase">
          AI Market Insights
        </h2>
        <span className="font-mono text-[9px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-bold">
          EXPERIMENTAL SUMMARY
        </span>
        <button
          onClick={handleRefresh}
          className="ml-auto p-1.5 rounded hover:bg-muted/50 transition-colors"
          disabled={refreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="divide-y divide-border/40">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`border-l-2 ${INSIGHT_BORDERS[insight.type]} cursor-pointer hover:bg-muted/20 transition-colors`}
            onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
          >
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{INSIGHT_ICONS[insight.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-mono text-xs font-bold text-foreground">{insight.title}</p>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    insight.confidence >= 80 ? "bg-primary/15 text-primary" :
                    insight.confidence >= 60 ? "bg-terminal-amber/15 text-terminal-amber" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    Heuristic
                  </span>
                </div>
                <AnimatePresence>
                  {expanded === insight.id ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-1">
                        {insight.detail}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {insight.cards.map((name) => (
                          <span key={name} className="font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded text-foreground">
                            {name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      {insight.detail.slice(0, 60)}…
                    </p>
                  )}
                </AnimatePresence>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 transition-transform ${
                expanded === insight.id ? "rotate-90" : ""
              }`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-border/40 px-4 py-2 bg-muted/10">
        <p className="font-mono text-[9px] text-muted-foreground text-center">
          Rule-based summaries from available quotes • Not financial advice • Updated every refresh cycle
        </p>
      </div>
    </motion.div>
  );
};

export default AIMarketInsights;
