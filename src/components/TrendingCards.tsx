import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import type { CardData } from "@/data/marketData";
import { getCardSignal } from "@/hooks/useSignalIndicator";
import { getCardToken } from "@/lib/tokenSymbols";
import SignalBadge from "@/components/SignalBadge";
import AffiliateLinks from "@/components/AffiliateLinks";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingCardsProps {
  cards: CardData[];
  isLoading?: boolean;
}

const TRENDING_DISPLAY = 8;
const ROTATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const TrendingCards = ({ cards, isLoading }: TrendingCardsProps) => {
  const navigate = useNavigate();
  const [rotationKey, setRotationKey] = useState(0);

  // Rotate trending cards every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => setRotationKey((k) => k + 1), ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const trending = useMemo(() => {
    // Pull from the FULL library (not top 100) and time-seeded shuffle so cards vary refresh-to-refresh.
    const withImages = cards.filter((c) => c._image);
    const pool = withImages.length > 0 ? withImages : cards;
    if (pool.length <= TRENDING_DISPLAY) return pool;

    // Time seed rotates every 5 minutes + manual rotationKey for in-session refresh
    const timeSeed = Math.floor(Date.now() / ROTATE_INTERVAL) + rotationKey;

    // Deterministic pseudo-random shuffle via sin-based key
    const shuffled = [...pool]
      .map((c, i) => ({ c, k: Math.sin((i + 1) * (timeSeed + 1) * 12.9898) * 43758.5453 }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.c);

    return shuffled.slice(0, TRENDING_DISPLAY);
  }, [cards, rotationKey]);

  if (isLoading) {
    return (
      <div className="terminal-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col p-4 border-b border-r border-border space-y-2">
              <Skeleton className="w-full aspect-[2.5/3.5] rounded-md" />
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-3 w-24" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-secondary uppercase">
          Trending Cards
        </h2>
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
          Updated Live
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {trending.map((card, i) => {
          const isUp = card.change >= 0;
          const slug = `${card.name}-${card.set}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/card/${slug}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/card/${slug}`); }}
              className="flex flex-col p-4 border-b border-r border-border hover:bg-muted/50 transition-colors text-left group last:border-r-0 relative overflow-hidden cursor-pointer"
            >
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

              {/* Card image */}
              {card._image ? (
                <div className="w-full aspect-[2.5/3.5] rounded-lg overflow-hidden mb-2 bg-muted ring-2 ring-border group-hover:ring-primary/40 transition-all duration-300 shadow-md">
                  <img
                    src={card._image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    style={{ imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.08)' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/icon-192.png'; (e.target as HTMLImageElement).style.objectFit = 'contain'; (e.target as HTMLImageElement).style.padding = '1rem'; }}
                  />
                </div>
              ) : (
                <div className="w-full aspect-[2.5/3.5] rounded-lg bg-muted flex items-center justify-center mb-2 ring-2 ring-border">
                  <span className="font-mono text-xs text-muted-foreground font-semibold">No Image</span>
                </div>
              )}

              {/* Token + Card info */}
              <span className="font-mono text-[10px] text-primary/80 font-bold tracking-wider">
                {getCardToken(card)}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground truncate w-full">
                {card.setCode && `(${card.setCode}) `}{card.set}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-sm font-bold text-foreground truncate">
                  {card.name}
                </span>
                <SignalBadge result={getCardSignal(card)} />
              </div>

              {/* Price */}
              <div className="flex items-center justify-between w-full mt-1.5">
                <span className="font-mono text-base font-bold text-foreground">
                  ${card.market.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`font-mono text-[10px] font-semibold flex items-center gap-0.5 ${
                    isUp ? "text-terminal-green" : "text-terminal-red"
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? "+" : ""}{card.change.toFixed(1)}%
                </span>
              </div>

              {/* Graded estimates */}
              <div className="mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">PSA 10</span>
                  <span className="font-mono text-[9px] text-foreground">
                    ~${(card.market * 3.5).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">PSA 9</span>
                  <span className="font-mono text-[9px] text-foreground">
                    ~${(card.market * 2).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Affiliate buy buttons — every card */}
              <div className="mt-2 pt-1.5 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
                <AffiliateLinks cardName={card.name} setName={card.set} compact />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TrendingCards;
