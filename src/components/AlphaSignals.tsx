import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";
import type { AlphaSignal } from "@/hooks/useAlphaSignals";

const signalConfig = {
  volume_divergence: { icon: AlertTriangle, color: "text-terminal-amber" },
  price_momentum: { icon: TrendingUp, color: "text-primary" },
  breakout: { icon: Zap, color: "text-terminal-green" },
  reversal: { icon: Target, color: "text-terminal-blue" },
};

const strengthBadge = {
  strong: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-terminal-amber/20 text-terminal-amber border-terminal-amber/30",
  weak: "bg-muted text-muted-foreground border-border",
};

interface AlphaSignalsProps {
  signals: AlphaSignal[];
}

const AlphaSignals = ({ signals }: AlphaSignalsProps) => {
  if (signals.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5 }}
    >
      <div className="terminal-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Alpha Signals — Predictive Divergence
          </h3>
          <div className="flex items-center gap-2">
            <a href="/methodology" className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold tracking-wider hover:bg-primary/20 transition-colors">
              ✓ VERIFIED BY PGVA
            </a>
            <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
              {signals.length} ACTIVE
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {signals.map((signal, idx) => {
            const config = signalConfig[signal.signalType];
            const Icon = config.icon;
            return (
              <motion.div
                key={`${signal.cardName}-${signal.signalType}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors"
              >
                <img
                  src={signal.cardImage || "/icon-192.png"}
                  alt={signal.cardName}
                  className={`w-10 h-14 rounded flex-shrink-0 ${signal.cardImage ? "object-contain" : "object-contain p-1 bg-muted"}`}
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/icon-192.png'; }}
                />
                <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Icon className={`w-3 h-3 flex-shrink-0 ${config.color}`} />
                    <span className="font-mono text-[11px] font-semibold text-foreground truncate max-w-[120px] sm:max-w-none">
                      {signal.cardName}
                    </span>
                    <span className={`font-mono text-[8px] px-1 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${strengthBadge[signal.strength]}`}>
                      {signal.strength}
                    </span>
                    <span className={`font-mono text-[9px] font-bold flex-shrink-0 ${signal.priceChangePct >= 0 ? "text-terminal-green" : "text-destructive"}`}>
                      {signal.priceChangePct >= 0 ? "+" : ""}{signal.priceChangePct.toFixed(1)}%
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="sticky bottom-0 z-10 border-t border-terminal-amber/30 bg-card/95 backdrop-blur-sm px-4 py-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-terminal-amber flex-shrink-0 animate-pulse" />
          <span className="font-mono text-[8px] text-terminal-amber font-semibold">
            ⚠ NOT FINANCIAL ADVICE — FOR INFORMATIONAL PURPOSES ONLY. Signals are algorithmic and do not constitute buy/sell recommendations. © PGVA Ventures, LLC.
          </span>
        </div>
      </div>
    </motion.section>
  );
};

export default AlphaSignals;
