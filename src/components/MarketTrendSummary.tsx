import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Activity, Zap, Info } from "lucide-react";
import type { CardData } from "@/data/marketData";
import { getCardSignal } from "@/hooks/useSignalIndicator";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import InfoDialog from "@/components/InfoDialog";

interface MarketTrendSummaryProps {
  cards: CardData[];
}

const STAT_INFO: Record<string, { title: string; description: string; details: string[] }> = {
  "Market Direction": {
    title: "Market Direction",
    description: "Aggregate sentiment from BUY vs. SELL signals across the live card pool.",
    details: [
      "BULLISH = more BUY than SELL signals among tracked cards.",
      "BEARISH = SELL signals dominate (often during release-week resupply).",
      "NEUTRAL = signals are evenly distributed; sit tight or watch volume.",
      "Calculated continuously from the AI Signal Distribution below.",
    ],
  },
  "Avg Change": {
    title: "Average 24h Change",
    description: "Mean percentage change across every card on the board.",
    details: [
      "Computed across all live tracked cards (raw + graded).",
      "Outliers are not removed — a single chase-card spike can shift this.",
      "Compare to the median move in the Top Movers table for context.",
    ],
  },
  "Gainers / Losers": {
    title: "Gainers / Losers",
    description: "How many cards moved up vs. down in the last 24 hours.",
    details: [
      "Breadth indicator — wide gainer lead = healthy uptrend.",
      "When losers outpace gainers but the index is flat, watch for distribution.",
      "Pro users see breadth filtered by era and rarity tier.",
    ],
  },
  "Volatility": {
    title: "Volatility (High / Low)",
    description: "Distribution of cards by realized volatility bucket.",
    details: [
      "High volatility = cards with >5% rolling 24h price swings.",
      "Low volatility = blue-chip vintage and stable graded slabs.",
      "Elevated high-vol counts often precede big breakouts or breakdowns.",
    ],
  },
};

const MarketTrendSummary = ({ cards }: MarketTrendSummaryProps) => {
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [headerInfoOpen, setHeaderInfoOpen] = useState(false);
  const signals = cards.map(c => getCardSignal(c));
  const buys = signals.filter(s => s.signal === "BUY").length;
  const sells = signals.filter(s => s.signal === "SELL").length;
  const holds = signals.filter(s => s.signal === "HOLD").length;

  const avgChange = cards.reduce((s, c) => s + c.change, 0) / cards.length;
  const gainers = cards.filter(c => c.change > 0).length;
  const losers = cards.filter(c => c.change < 0).length;

  const highVol = signals.filter(s => s.volatility === "high").length;
  const lowVol = signals.filter(s => s.volatility === "low").length;

  const overallSentiment = buys > sells ? "BULLISH" : buys < sells ? "BEARISH" : "NEUTRAL";
  const sentimentColor = overallSentiment === "BULLISH" ? "text-terminal-green" : overallSentiment === "BEARISH" ? "text-terminal-red" : "text-terminal-amber";

  const stats = [
    { label: "Market Direction", value: overallSentiment, color: sentimentColor, icon: Activity },
    { label: "Avg Change", value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`, color: avgChange >= 0 ? "text-terminal-green" : "text-terminal-red", icon: avgChange >= 0 ? TrendingUp : TrendingDown },
    { label: "Gainers / Losers", value: `${gainers} / ${losers}`, color: gainers > losers ? "text-terminal-green" : "text-terminal-red", icon: BarChart3 },
    { label: "Volatility", value: `${highVol} High / ${lowVol} Low`, color: highVol > cards.length * 0.3 ? "text-terminal-amber" : "text-terminal-green", icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" /> Market Trend Summary
          <button
            onClick={() => setHeaderInfoOpen(true)}
            aria-label="What is Market Trend Summary?"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Info className="w-3 h-3" />
          </button>
        </h2>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
            overallSentiment === "BULLISH" ? "bg-terminal-green/15 text-terminal-green" :
            overallSentiment === "BEARISH" ? "bg-terminal-red/15 text-terminal-red" :
            "bg-terminal-amber/15 text-terminal-amber"
          }`}>
            {overallSentiment}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Predictability Index
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.button
              type="button"
              onClick={() => setActiveStat(stat.label)}
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="px-3 py-4 text-center space-y-1.5 hover:bg-muted/30 transition-colors cursor-pointer relative group"
            >
              <Info className="w-2.5 h-2.5 text-muted-foreground/40 absolute top-1.5 right-1.5 group-hover:text-primary transition-colors" />
              <div className="w-8 h-8 rounded-md bg-muted mx-auto flex items-center justify-center">
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`font-mono text-sm font-bold ${stat.color}`}>{stat.value}</p>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Signal distribution */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            AI Signal Distribution
          </span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(buys / cards.length) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-terminal-green rounded-l-full"
            title={`${buys} BUY signals`}
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(holds / cards.length) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-terminal-amber"
            title={`${holds} HOLD signals`}
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(sells / cards.length) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-terminal-red rounded-r-full"
            title={`${sells} SELL signals`}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[9px] text-terminal-green">{buys} BUY</span>
          <span className="font-mono text-[9px] text-terminal-amber">{holds} HOLD</span>
          <span className="font-mono text-[9px] text-terminal-red">{sells} SELL</span>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <FinancialDisclaimer compact />
      </div>

      <InfoDialog
        open={!!activeStat}
        onOpenChange={(open) => !open && setActiveStat(null)}
        title={activeStat ? STAT_INFO[activeStat]?.title : ""}
        description={activeStat ? STAT_INFO[activeStat]?.description : undefined}
      >
        {activeStat && (
          <ul className="space-y-1.5">
            {STAT_INFO[activeStat]?.details.map((d) => (
              <li key={d} className="font-mono text-[11px] text-foreground flex gap-2">
                <span className="text-primary">›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </InfoDialog>

      <InfoDialog
        open={headerInfoOpen}
        onOpenChange={setHeaderInfoOpen}
        title="Market Trend Summary"
        description="Four headline metrics summarizing the live state of the Pokémon TCG market."
      >
        <p className="font-mono text-[11px] text-foreground">
          Each tile shows a different lens on market health. Tap any tile to read how it is calculated and how to use it.
        </p>
        <p className="font-mono text-[11px] text-foreground">
          The AI Signal Distribution bar at the bottom shows the underlying BUY / HOLD / SELL split that drives the Market Direction tile.
        </p>
      </InfoDialog>
    </motion.div>
  );
};

export default MarketTrendSummary;
