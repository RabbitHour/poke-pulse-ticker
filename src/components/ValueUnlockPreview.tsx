import { motion } from "framer-motion";
import { Lock, TrendingUp, Zap, BarChart3, Brain, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const lockedFeatures = [
  {
    icon: TrendingUp,
    title: "Alpha Signals Detected",
    value: "7 BUY signals right now",
    blurredDetail: "AI found undervalued cards before the market catches on…",
    color: "text-primary",
    liveCount: Math.floor(5 + Math.random() * 8),
  },
  {
    icon: BarChart3,
    title: "Portfolio P&L Tracking",
    value: "+$2,847 avg. Pro user gain",
    blurredDetail: "Real-time cost basis, daily snapshots, capital gains reports",
    color: "text-terminal-amber",
    liveCount: null,
  },
  {
    icon: Brain,
    title: "AI Price Predictions",
    value: "78% accuracy this month",
    blurredDetail: "30-day MA divergence + RSI/SMA overlays predict direction",
    color: "text-terminal-blue",
    liveCount: null,
  },
  {
    icon: Shield,
    title: "Grading Arbitrage Alerts",
    value: `${Math.floor(8 + Math.random() * 12)} profitable grades found`,
    blurredDetail: "Raw→PSA 10 profit margin alerts + cross-marketplace spreads",
    color: "text-purple-400",
    liveCount: null,
  },
];

const ValueUnlockPreview = () => {
  const navigate = useNavigate();
  const { subscribed, tier } = useAuth();
  const isPro = subscribed && (tier === "pro" || tier === "premium" || tier === "team" || tier === "whale");

  if (isPro) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5 }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-primary/20 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-foreground uppercase flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-primary" />
          What Pro Users See Right Now
        </h3>
        <span className="font-mono text-[9px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold animate-pulse">
          LIVE DATA
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {lockedFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 space-y-2 relative group"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${feat.color}`} />
                <span className="font-mono text-xs font-bold text-foreground">{feat.title}</span>
              </div>
              <p className={`font-mono text-sm font-bold ${feat.color}`}>{feat.value}</p>
              <p className="font-mono text-[11px] text-muted-foreground blur-[3px] select-none">
                {feat.blurredDetail}
              </p>
              {/* Lock overlay on detail */}
              <div className="absolute bottom-3 right-4">
                <Lock className="w-3 h-3 text-muted-foreground/40" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
        <p className="font-mono text-[11px] text-muted-foreground">
          Unlock all features with a <span className="text-primary font-bold">14-day free trial</span> — cancel anytime
        </p>
        <button
          onClick={() => navigate("/pricing")}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-bold bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(160_84%_50%/0.3)] transition-all min-h-[44px]"
        >
          <Zap className="w-3.5 h-3.5" />
          Start Free Trial
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default ValueUnlockPreview;
