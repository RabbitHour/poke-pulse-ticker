import { useEffect, useMemo, useState } from "react";
import { useLiveCards, useLiveCardsQuick } from "@/hooks/usePokemonTcg";
import { Link } from "react-router-dom";
import type { CardData } from "@/data/marketData";

interface Props {
  title?: string;
  subtitle?: string;
  count?: number;
  /** "movers" = sort by |change|, "value" = sort by market price desc, "mix" = interleave */
  mode?: "movers" | "value" | "mix";
  /** Skip the first N cards of the sorted pool (useful so two strips don't show identical sets). */
  offset?: number;
}

// Block placeholder / card-back images so we never render a broken tile.
function isBadImageUrl(url?: string): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  return (
    u.includes("icon-192") ||
    u.includes("cardback") ||
    u.includes("placeholder") ||
    u.endsWith("/back.png") ||
    u.endsWith("/back.jpg")
  );
}

const LiveCardStrip = ({
  title = "LIVE CARDS",
  subtitle = "Live TCGPlayer pricing — refreshed every 30 min",
  count = 18,
  mode = "mix",
  offset = 0,
}: Props) => {
  const { data: fullCards, isLoading } = useLiveCards();
  const { data: quickCards } = useLiveCardsQuick();
  const rawCards = (fullCards && fullCards.length > 0) ? fullCards : quickCards;

  // Rotate the visible window every 30 minutes to the NEXT batch of
  // top movers/value cards, wrapping around the ordered pool.
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setRotation((r) => r + 1), 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const cards = useMemo(() => {
    if (!rawCards || rawCards.length === 0) return [] as (CardData & { _apiId?: string; _image?: string })[];
    const pool = (rawCards as any[]).filter(
      (c) => c?._apiId && c?._image && !isBadImageUrl(c._image) && Number(c?.market) > 0
    );

    const byValue = [...pool].sort((a, b) => (b.market || 0) - (a.market || 0));
    const byMovers = [...pool].sort(
      (a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0)
    );

    let ordered: any[];
    if (mode === "value") ordered = byValue;
    else if (mode === "movers") ordered = byMovers;
    else {
      // Interleave so we get a healthy mix of expensive + active cards.
      const seen = new Set<string>();
      ordered = [];
      const max = Math.max(byValue.length, byMovers.length);
      for (let i = 0; i < max; i++) {
        for (const c of [byMovers[i], byValue[i]]) {
          if (!c) continue;
          if (seen.has(c._apiId)) continue;
          seen.add(c._apiId);
          ordered.push(c);
        }
      }
    }

    if (ordered.length === 0) return [];
    const start = (offset + rotation * count) % ordered.length;
    const out: any[] = [];
    for (let i = 0; i < count && i < ordered.length; i++) {
      out.push(ordered[(start + i) % ordered.length]);
    }
    return out;
  }, [rawCards, count, mode, offset, rotation]);

  if (isLoading && cards.length === 0) {
    return (
      <div className="terminal-card p-3 sm:p-4">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-mono text-xs sm:text-sm font-bold text-foreground">{title}</h2>
          <span className="font-mono text-[9px] text-muted-foreground">loading…</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="terminal-card p-3 sm:p-4">
      <div className="flex items-baseline justify-between mb-2 gap-2">
        <div className="min-w-0">
          <h2 className="font-mono text-xs sm:text-sm font-bold text-foreground truncate">
            {title}
          </h2>
          <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground truncate">
            {subtitle}
          </p>
        </div>
        <span className="font-mono text-[9px] text-primary shrink-0">● LIVE</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
        {cards.map((c) => {
          const up = (c.change || 0) >= 0;
          const href = c._apiId ? `/card/${c._apiId}` : "#";
          return (
            <Link
              key={c._apiId}
              to={href}
              className="group relative overflow-hidden rounded-md border border-primary/15 bg-muted/30 hover:border-primary/50 transition-colors"
            >
              <div
                className={`absolute top-1 right-1 z-10 px-1 py-0.5 rounded font-mono text-[8px] font-bold ${
                  up
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {up ? "+" : ""}
                {(c.change || 0).toFixed(1)}%
              </div>
              <div className="aspect-[3/4] w-full overflow-hidden bg-muted/40">
                <img
                  src={c._image}
                  alt={`${c.name} — live price`}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-1.5 bg-background/70">
                <p
                  className="text-[10px] font-semibold text-foreground truncate"
                  title={c.name}
                >
                  {c.name}
                </p>
                {c.set && (
                  <p className="text-[8px] text-muted-foreground/80 truncate">{c.set}</p>
                )}
                <p className="text-[9px] font-mono text-primary">
                  ${Number(c.market).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default LiveCardStrip;
