import { useEffect, useMemo, useState } from "react";
import type { CardData } from "@/data/marketData";
import { getCardToken } from "@/lib/tokenSymbols";
import { useEbayPrices, ebayPriceMap, ebayChangeMap } from "@/hooks/useEbayPrices";
import { ebayAffiliateLink } from "@/lib/ebay";

interface TickerBarProps {
  cards?: CardData[];
  isLive?: boolean;
  lastUpdated?: number;
}

const TickerBar = ({ cards = [], isLive = false, lastUpdated }: TickerBarProps) => {
  const [countdown, setCountdown] = useState("");

  const candidateCards = useMemo(() => {
    // Pull a broader candidate pool so the live eBay layer has enough cards
    // to choose from even when many quotes are currently flat.
    return [...cards]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
  }, [cards, lastUpdated]);

  // Primary price source: eBay Browse API (median active listing price).
  // Falls back to TCGPlayer market price if eBay returns no result for a query.
  const ebayQueries = useMemo(
    () => Array.from(new Set(candidateCards.slice(0, 30).map((c) => `${c.name} ${c.set}`))),
    [candidateCards]
  );
  const { data: ebayData } = useEbayPrices(ebayQueries);
  const priceMap = useMemo(() => ebayPriceMap(ebayData?.results), [ebayData]);
  const changeMap = useMemo(() => ebayChangeMap(ebayData?.results), [ebayData]);
  const keyFor = (card: CardData) => `${card.name} ${card.set}`.toLowerCase();
  const priceFor = (card: CardData) => priceMap[keyFor(card)] || card.market;
  const changeFor = (card: CardData) => {
    const live = changeMap[keyFor(card)];
    return typeof live === "number" ? live : card.change;
  };

  const tickerCards = useMemo(() => {
    // Prefer cards with real live movement so the tape does not flatten at 0.0%.
    // If live movement is sparse, gracefully fall back to the broader candidate pool.
    const ranked = candidateCards
      .slice(0, 30)
      .map((card) => {
        const live = changeMap[keyFor(card)];
        return {
          card,
          liveChange: typeof live === "number" ? live : null,
          displayChange: typeof live === "number" ? live : card.change,
        };
      })
      .sort((a, b) => {
        const aHasLiveMovement = a.liveChange !== null && Math.abs(a.liveChange) >= 0.01;
        const bHasLiveMovement = b.liveChange !== null && Math.abs(b.liveChange) >= 0.01;
        if (aHasLiveMovement !== bHasLiveMovement) return Number(bHasLiveMovement) - Number(aHasLiveMovement);
        return Math.abs(b.displayChange) - Math.abs(a.displayChange);
      });

    const pool = ranked.slice(0, 16);
    const seed = Math.floor(Date.now() / (10 * 60 * 1000));
    const shuffled = [...pool]
      .map((entry, i) => ({ entry, k: Math.sin((i + 1) * (seed + 1) * 9301) * 233280 }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.entry.card);

    return [...shuffled, ...shuffled];
  }, [candidateCards, changeMap]);

  useEffect(() => {
    if (!lastUpdated) return;

    const REFRESH_MS = 60 * 60 * 1000;

    const tick = () => {
      const elapsed = Date.now() - lastUpdated;
      const remaining = Math.max(0, REFRESH_MS - elapsed);
      const mins = Math.floor(remaining / 60_000);
      const secs = Math.floor((remaining % 60_000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  if (!tickerCards.length) return null;

  return (
    <div className="border-b border-border/40 bg-terminal-header overflow-hidden">
      <div className="flex items-center">
        {isLive && countdown && (
          <div className="flex-shrink-0 px-2.5 py-1.5 border-r border-border/40 bg-terminal-header z-10 relative shadow-[6px_0_12px_4px_hsl(var(--terminal-header))]">
            <span className="font-mono text-[9px] text-secondary uppercase tracking-wider font-bold">
              ↻ {countdown}
            </span>
          </div>
        )}

        <div
          className="ticker-scroll flex whitespace-nowrap py-1.5"
          style={{ animationDuration: `${Math.max(70, tickerCards.length * 5.5)}s` }}
        >
          {tickerCards.map((card, i) => {
            const price = priceFor(card);
            const change = changeFor(card);
            return (
              <a
                key={`${card.name}-${i}`}
                href={ebayAffiliateLink(`${card.name} ${card.set}`)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 px-4 font-mono text-xs hover:bg-primary/5 transition-colors"
              >
                <span className="text-primary font-bold text-[10px]">{getCardToken(card)}</span>
                <span className="text-foreground/80 font-medium">{card.name}</span>
                <span className="text-foreground font-semibold">
                  ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={change >= 0 ? "text-terminal-green" : "text-terminal-red"}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
                <span className="text-border/40">•</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TickerBar;
