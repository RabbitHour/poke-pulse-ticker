import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, Minus, Trophy, Info } from "lucide-react";
import { getSeasonalTrend, getGradeSpread } from "@/components/VolumeConfidence";
import type { CardData } from "@/data/marketData";
import InfoDialog from "@/components/InfoDialog";

interface MarketIntelWidgetProps {
  cards: CardData[];
}

type IntelKey = "seasonality" | "grade-spread" | "auto-tracked" | "header";

const INTEL_INFO: Record<IntelKey, { title: string; description: string; details: string[] }> = {
  seasonality: {
    title: "Historical Seasonality",
    description: "Multi-year price patterns that tend to repeat at specific times of year.",
    details: [
      "Built from 5+ years of TCGPlayer + eBay sold data across the same date windows.",
      "Up = historically bullish window (e.g., holiday gifting, anniversary sets).",
      "Down = historical resupply or post-release cool-off.",
      "Use this as a tailwind/headwind on top of your own signals — never standalone.",
    ],
  },
  "grade-spread": {
    title: "Grade Spread (PSA 10 / 9)",
    description: "How much a PSA 10 trades above its PSA 9 counterpart for the top card.",
    details: [
      "A wide spread = scarcity premium and strong grading ROI potential.",
      "A tight spread = pop report saturation; grading is unlikely to net out.",
      "Pulled live from the consensus engine using same-card paired comps.",
      "Drill into Grading Arbitrage Scanner (Pro) for full grade-curve analysis.",
    ],
  },
  "auto-tracked": {
    title: "Auto-Tracked Sets",
    description: "How many distinct sets are currently active in the live data feed.",
    details: [
      "New sets are detected automatically from pokemontcg.io within minutes of release.",
      "Refresh cycle = 60s for prices, 30 min for the full card library.",
      "Currently spans 6 eras: Vintage, EX, DP/Platinum, BW/XY, Sun & Moon, Modern.",
      "Sets with <2 tracked cards are not surfaced in Era or Set widgets.",
    ],
  },
  header: {
    title: "Market Intelligence",
    description: "Three contextual signals that complement raw price action.",
    details: [
      "Seasonality — historical timing tailwind/headwind.",
      "Grade Spread — scarcity premium between graded tiers.",
      "Auto-Tracked — live coverage breadth.",
      "Tap any tile to read how it is sourced and how to act on it.",
    ],
  },
};

const MarketIntelWidget = ({ cards }: MarketIntelWidgetProps) => {
  const [activeKey, setActiveKey] = useState<IntelKey | null>(null);
  const seasonal = getSeasonalTrend();
  const topCard = cards[0];
  const gradeSpread = topCard ? getGradeSpread(topCard.market) : null;
  const uniqueSets = new Set(cards.map((c) => c.set)).size;

  const SeasonIcon =
    seasonal.direction === "up" ? TrendingUp : seasonal.direction === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5 }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Market Intelligence
          <button
            onClick={() => setActiveKey("header")}
            aria-label="What is Market Intelligence?"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Info className="w-3 h-3" />
          </button>
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Seasonality */}
        <button
          type="button"
          onClick={() => setActiveKey("seasonality")}
          className="p-4 space-y-2 text-left hover:bg-muted/30 transition-colors relative group"
        >
          <Info className="w-3 h-3 text-muted-foreground/40 absolute top-2 right-2 group-hover:text-primary transition-colors" />
          <div className="flex items-center gap-2">
            <SeasonIcon
              className={`w-4 h-4 ${
                seasonal.direction === "up"
                  ? "text-terminal-green"
                  : seasonal.direction === "down"
                  ? "text-terminal-red"
                  : "text-terminal-amber"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold ${
                seasonal.direction === "up"
                  ? "text-terminal-green"
                  : seasonal.direction === "down"
                  ? "text-terminal-red"
                  : "text-terminal-amber"
              }`}
            >
              {seasonal.label}
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
            {seasonal.description}
          </p>
          <span className="font-mono text-[8px] text-muted-foreground/60 uppercase tracking-wider">
            Historical Seasonality
          </span>
        </button>

        {/* Grade Spread */}
        {gradeSpread && topCard && (
          <button
            type="button"
            onClick={() => setActiveKey("grade-spread")}
            className="p-4 space-y-2 text-left hover:bg-muted/30 transition-colors relative group"
          >
            <Info className="w-3 h-3 text-muted-foreground/40 absolute top-2 right-2 group-hover:text-primary transition-colors" />
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-terminal-amber" />
              <span className="font-mono text-xs font-bold text-foreground">Grade Spread</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">PSA 10/9 Ratio</span>
                <span className="font-mono text-[10px] text-foreground font-semibold">{gradeSpread.ratio}x</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">Spread</span>
                <span className="font-mono text-[10px] text-terminal-amber font-semibold">{gradeSpread.spread}</span>
              </div>
            </div>
            <p className="font-mono text-[9px] text-muted-foreground">{gradeSpread.signal}</p>
          </button>
        )}

        {/* Market Adaptability */}
        <button
          type="button"
          onClick={() => setActiveKey("auto-tracked")}
          className="p-4 space-y-2 text-left hover:bg-muted/30 transition-colors relative group"
        >
          <Info className="w-3 h-3 text-muted-foreground/40 absolute top-2 right-2 group-hover:text-primary transition-colors" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs font-bold text-foreground">Auto-Tracked</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">Active Sets</span>
              <span className="font-mono text-[10px] text-primary font-semibold">{uniqueSets}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">Refresh Cycle</span>
              <span className="font-mono text-[10px] text-primary font-semibold">60s live</span>
            </div>
          </div>
          <p className="font-mono text-[9px] text-muted-foreground">
            New sets auto-detected from pokemontcg.io API
          </p>
        </button>
      </div>

      <div className="border-t border-border px-4 py-1.5 flex items-center gap-1.5">
        <span className="font-mono text-[8px] text-muted-foreground/60">
          Seasonality data based on historical Poké TCG market patterns. Not financial advice. © PGVA Ventures, LLC.
        </span>
      </div>

      <InfoDialog
        open={!!activeKey}
        onOpenChange={(open) => !open && setActiveKey(null)}
        title={activeKey ? INTEL_INFO[activeKey].title : ""}
        description={activeKey ? INTEL_INFO[activeKey].description : undefined}
      >
        {activeKey && (
          <ul className="space-y-1.5">
            {INTEL_INFO[activeKey].details.map((d) => (
              <li key={d} className="font-mono text-[11px] text-foreground flex gap-2">
                <span className="text-primary">›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </InfoDialog>
    </motion.div>
  );
};

export default MarketIntelWidget;
