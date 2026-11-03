import { motion } from "framer-motion";
import { Trophy, TrendingUp, Crown, Medal, Award, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  portfolioValue: number;
  roi: number;
  cardCount: number;
  topHolding: string;
  joinedAgo: string;
}

/**
 * Deterministic anonymous leaderboard based on seeded data.
 * In production, this would pull from aggregated portfolio_snapshots.
 */
const generateLeaderboard = (): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [
    { rank: 1, name: "Collector_α", portfolioValue: 184200, roi: 42.3, cardCount: 312, topHolding: "Charizard 1st Ed PSA 10", joinedAgo: "8 months" },
    { rank: 2, name: "VintageHunter", portfolioValue: 127800, roi: 38.7, cardCount: 189, topHolding: "Pikachu Illustrator PSA 9", joinedAgo: "1 year" },
    { rank: 3, name: "SealedVault", portfolioValue: 98400, roi: 31.2, cardCount: 45, topHolding: "Skyridge Booster Box", joinedAgo: "6 months" },
    { rank: 4, name: "GradedGuru", portfolioValue: 76500, roi: 28.9, cardCount: 156, topHolding: "Lugia Neo Gen PSA 10", joinedAgo: "11 months" },
    { rank: 5, name: "MoonCards", portfolioValue: 64200, roi: 24.1, cardCount: 234, topHolding: "Gold Star Rayquaza PSA 9", joinedAgo: "5 months" },
    { rank: 6, name: "BaseSetKing", portfolioValue: 52800, roi: 21.5, cardCount: 98, topHolding: "Shadowless Charizard CGC 9.5", joinedAgo: "1 year" },
    { rank: 7, name: "DeltaTrader", portfolioValue: 41300, roi: 19.8, cardCount: 167, topHolding: "Crystal Charizard CGC 9", joinedAgo: "4 months" },
    { rank: 8, name: "NeoCollector", portfolioValue: 38700, roi: 17.2, cardCount: 203, topHolding: "Shining Charizard PSA 9", joinedAgo: "9 months" },
    { rank: 9, name: "RocketInvestor", portfolioValue: 29400, roi: 14.6, cardCount: 88, topHolding: "Dark Charizard PSA 10", joinedAgo: "3 months" },
    { rank: 10, name: "PulseTracker", portfolioValue: 21900, roi: 11.3, cardCount: 145, topHolding: "Umbreon Skyridge BGS 9.5", joinedAgo: "7 months" },
  ];
  return entries;
};

const rankIcons: Record<number, typeof Trophy> = {
  1: Crown,
  2: Medal,
  3: Award,
};

const rankColors: Record<number, string> = {
  1: "text-terminal-amber",
  2: "text-muted-foreground",
  3: "text-orange-400",
};

const VerifiedLeaderboard = () => {
  const leaderboard = useMemo(() => generateLeaderboard(), []);
  const [obfuscate, setObfuscate] = useState(false);

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
            <Trophy className="w-3.5 h-3.5" /> Verified Portfolio Leaderboard
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setObfuscate(!obfuscate)}
              className="font-mono text-[9px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              title="Toggle Financial Data Obfuscation"
            >
              <EyeOff className="w-2.5 h-2.5" />
              {obfuscate ? "SHOW $" : "HIDE $"}
            </button>
            <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
              ANONYMOUS • LIVE ROI
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase w-12">#</th>
                <th className="px-3 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Collector</th>
                <th className="px-3 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Value</th>
                <th className="px-3 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">ROI</th>
                <th className="px-3 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase hidden sm:table-cell">Cards</th>
                <th className="px-3 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase hidden md:table-cell">Top Holding</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const RankIcon = rankIcons[entry.rank] || TrendingUp;
                const rankColor = rankColors[entry.rank] || "text-muted-foreground";
                return (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className="data-row"
                  >
                    <td className="px-3 py-2.5 text-center">
                      <RankIcon className={`w-4 h-4 mx-auto ${rankColor}`} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs font-semibold text-foreground">{entry.name}</span>
                      <span className="font-mono text-[9px] text-muted-foreground ml-2 hidden sm:inline">
                        joined {entry.joinedAgo} ago
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold text-foreground">
                      {obfuscate ? "••••••" : `$${entry.portfolioValue.toLocaleString()}`}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-mono text-sm font-bold text-terminal-green">
                        +{entry.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      {entry.cardCount}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground hidden md:table-cell truncate max-w-[180px]">
                      {entry.topHolding}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[9px] text-muted-foreground">
            ROI calculated from purchase price vs. current market value • Updated daily
          </span>
          <span className="font-mono text-[9px] text-primary">
            Track yours → Portfolio
          </span>
        </div>
      </div>
    </motion.section>
  );
};

export default VerifiedLeaderboard;
