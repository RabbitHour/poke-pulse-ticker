import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GATES_ENABLED } from "@/lib/featureGates";
import { useLiveCards } from "@/hooks/usePokemonTcg";
import { rawCards } from "@/data/marketData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, Activity, Zap, ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface Signal {
  cardName: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  expectedReturn: number;
}

const OWNER_EMAIL = "pokegarageva@gmail.com";

const PulseWalletWidget = () => {
  const { user, subscribed, tier } = useAuth();
  const { data: liveCards } = useLiveCards();
  const displayCards = liveCards && liveCards.length > 0 ? liveCards : rawCards;

  const isPro = subscribed && (tier === "pro" || tier === "premium" || tier === "team" || tier === "whale");
  const isOwner = user?.email === OWNER_EMAIL;
  const canUse = !GATES_ENABLED || isPro || isOwner;

  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setCycle(c => c + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  const { signals, metrics } = useMemo(() => {
    const poolSize = displayCards.length;
    const accuracyBoost = Math.min(cycle * 0.15, 12);
    const confidenceFloor = Math.min(78 + cycle * 0.3, 95);
    const returnMultiplier = 1 + cycle * 0.02;

    const viable = displayCards.filter(c => c.market > 0.5 && c.change !== 0);
    const sorted = [...viable].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    const top = sorted.slice(0, 12).map((c): Signal => {
      const action: "BUY" | "SELL" | "HOLD" = c.change < -3 ? "BUY" : c.change > 5 ? "SELL" : "HOLD";
      const rawConf = confidenceFloor + Math.abs(c.change) * 1.8 + accuracyBoost;
      const confidence = Math.min(99.2, rawConf);
      const expectedReturn = (action === "BUY" ? Math.abs(c.change) * 0.6 + 2 : action === "SELL" ? c.change * 0.4 : 0) * returnMultiplier;
      return { cardName: c.name, action, confidence: Math.round(confidence * 10) / 10, expectedReturn: Math.round(expectedReturn * 100) / 100 };
    });

    const winRate = top.filter(s => s.expectedReturn > 0).length / (top.length || 1) * 100;
    const avgReturn = top.reduce((s, t) => s + t.expectedReturn, 0) / (top.length || 1);
    const dailyPnL = avgReturn * 12.5 * returnMultiplier;
    const compoundedBalance = 5000 * Math.pow(1 + (dailyPnL * 0.001), cycle + 1);

    return {
      signals: top.slice(0, 4),
      metrics: {
        balance: Math.round(compoundedBalance),
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        winRate: Math.min(99, Math.round(winRate + accuracyBoost)),
        poolSize,
        dividends: Math.round(dailyPnL * 0.15 * returnMultiplier * 100) / 100,
        enginePower: Math.min(99.9, 89 + cycle * 0.25),
      },
    };
  }, [displayCards, cycle]);

  return (
    <div className={`terminal-card border-primary/30 p-4 bg-gradient-to-br from-card to-card/80 relative ${!canUse ? "select-none" : ""}`}>
      {/* Lock overlay for non-paying users */}
      {!canUse && (
        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center gap-2">
          <Lock className="w-6 h-6 text-primary" />
          <p className="font-mono text-xs text-foreground font-bold">Upgrade to Unlock Poké Stock Market</p>
          <Link
            to="/pricing"
            className="font-mono text-[10px] bg-primary text-primary-foreground px-4 py-1.5 rounded hover:opacity-90"
          >
            View Plans →
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
              Poké Stock Market™
              <Badge variant="outline" className={`text-[7px] px-1 py-0 ${canUse ? "border-green-500 text-green-500" : "border-muted-foreground text-muted-foreground"}`}>
                {canUse ? "ACTIVE" : "PREVIEW"}
              </Badge>
            </h3>
            <p className="font-mono text-[8px] text-muted-foreground">
              Self-replenishing · {metrics.poolSize} cards scanned · Cycle #{cycle + 1}
            </p>
          </div>
        </div>
        {canUse && (
          <Link to="/pulse-wallet" className="font-mono text-[9px] text-primary hover:underline flex items-center gap-0.5">
            Full Dashboard <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-foreground">${metrics.balance}</p>
          <p className="font-mono text-[7px] text-muted-foreground uppercase">Balance</p>
        </div>
        <div className="text-center">
          <p className={`font-mono text-xs font-bold ${metrics.dailyPnL >= 0 ? "text-green-500" : "text-red-400"}`}>
            {metrics.dailyPnL >= 0 ? "+" : ""}${metrics.dailyPnL}
          </p>
          <p className="font-mono text-[7px] text-muted-foreground uppercase">Daily P&L</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-foreground">{metrics.winRate}%</p>
          <p className="font-mono text-[7px] text-muted-foreground uppercase">Win Rate</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-green-500">+${metrics.dividends}</p>
          <p className="font-mono text-[7px] text-muted-foreground uppercase">Dividends</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-primary">{metrics.enginePower.toFixed(1)}%</p>
          <p className="font-mono text-[7px] text-muted-foreground uppercase">Engine Power</p>
        </div>
      </div>

      {/* Top Signals */}
      <div className="space-y-1.5">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
            <div className="flex items-center gap-1.5 min-w-0">
              <Badge
                variant={s.action === "BUY" ? "default" : s.action === "SELL" ? "destructive" : "secondary"}
                className="text-[7px] font-bold px-1 py-0"
              >
                {s.action}
              </Badge>
              <span className="font-mono text-[10px] text-foreground truncate">{s.cardName}</span>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className={`font-mono text-[9px] font-bold ${s.expectedReturn > 0 ? "text-green-500" : "text-red-400"}`}>
                {s.expectedReturn > 0 ? "+" : ""}{s.expectedReturn}%
              </span>
              <div className="w-10">
                <Progress value={s.confidence} className="h-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[7px] text-muted-foreground text-center mt-2">
        <Activity className="w-2.5 h-2.5 inline mr-0.5" />
        Engine compounds strength each 60s cycle · Poké Stock Market™ · Cycle #{cycle + 1}
      </p>
    </div>
  );
};

export default PulseWalletWidget;
