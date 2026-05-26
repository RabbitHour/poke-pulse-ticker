import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLiveCardsQuick } from "@/hooks/usePokemonTcg";
import { useIsMobile } from "@/hooks/use-mobile";
import { rawCards as fallbackCards } from "@/data/marketData";

type Mover = {
  key: string;
  label: string;
  name: string;
  set?: string;
  market: number;
  change: number;
  image: string;
};

const ROTATE_MS = 30 * 60 * 1000; // rotate the visible 3 every 30 minutes

// Block placeholder / card-back / generic images so we never show "no image" tiles.
function isBadImageUrl(url?: string): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  return (
    u.includes("icon-192") ||
    u.includes("cardback") ||
    u.includes("placeholder") ||
    u.includes("/back.") ||
    u.endsWith("/back.png") ||
    u.endsWith("/back.jpg")
  );
}

// RELIABILITY RULE: only show cards whose image, name, set, and market price
// all come from the SAME live TCGplayer record. No synthetic/graded multipliers,
// no static fallback data — if we can't be reliable on price, we don't render.
function buildPool(rawCards: any[], badImages: Set<string>): Mover[] {
  const seen = new Set<string>();
  const pool: Mover[] = [];

  const pushIfGood = (c: any) => {
    const image: string | undefined = c?._image || c?.image;
    if (!image || isBadImageUrl(image) || badImages.has(image)) return;
    // Require a live API id so we know image + price came from the same record.
    if (!c?._apiId) return;
    const market = Number(c?.market) || 0;
    const change = Number(c?.change) || 0;
    if (market <= 0) return;
    const key = `${c._apiId}|${image}`;
    if (seen.has(key)) return;
    seen.add(key);
    pool.push({ key, label: "RAW", name: c.name, set: c?.set, market, change, image });
  };

  // Sort by |change| first so true movers float up, but DO NOT exclude
  // change===0 — many TCGplayer-only cards have no Cardmarket momentum
  // and would otherwise empty the hero entirely.
  [...rawCards]
    .sort((a, b) => Math.abs((b.change ?? 0)) - Math.abs((a.change ?? 0)))
    .slice(0, 80)
    .forEach(pushIfGood);

  return pool.slice(0, 15);

}

const HeroTopMovers = () => {
  const { data: rawCards, refetch, isFetching } = useLiveCardsQuick();
  const isMobile = useIsMobile();

  const [rotationIndex, setRotationIndex] = useState(0);
  const [badImages, setBadImages] = useState<Set<string>>(new Set());

  // Rotate visible cards every 30 minutes (in sync with live-cards refetch cadence).
  useEffect(() => {
    const id = setInterval(() => setRotationIndex((i) => i + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  // 🐕 Claude Watchdog — always on guard. If the hero ever loses live data
  // (empty pool, all images marked bad, or API silently failed), force a refetch
  // every 60s until live data comes back. Never lets the hero break down.
  useEffect(() => {
    const id = setInterval(() => {
      const empty = !rawCards || rawCards.length === 0;
      if (empty && !isFetching) {
        console.warn("[HeroTopMovers Watchdog] No live cards — forcing refetch.");
        refetch();
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [rawCards, isFetching, refetch]);

  // Recover from accumulated bad-image marks once per hour so a transient
  // CDN hiccup doesn't permanently shrink the pool.
  useEffect(() => {
    const id = setInterval(() => setBadImages(new Set()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);


  const pool = useMemo(() => {
    const sourceCards = rawCards && rawCards.length > 0 ? rawCards : fallbackCards;
    return buildPool(sourceCards as any[], badImages);
  }, [rawCards, badImages]);

  const visible = useMemo(() => {
    if (pool.length === 0) return [] as Mover[];
    const need = isMobile ? 3 : 5;
    const start = (rotationIndex * need) % pool.length;
    const out: Mover[] = [];
    for (let i = 0; i < need && i < pool.length; i++) {
      out.push(pool[(start + i) % pool.length]);
    }
    return out;
  }, [pool, rotationIndex, isMobile]);

  const markBad = (url: string) =>
    setBadImages((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });

  // While live data is loading (or temporarily empty), show skeleton tiles
  // instead of returning null — so the hero never goes blank during the
  // initial multi-page TCGplayer pull (can take 30-60s on a fresh visit).
  if (visible.length === 0) {
    const count = isMobile ? 3 : 5;
    if (isMobile) {
      return (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-lg border border-primary/20 bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      );
    }
    return (
      <div className="relative w-full h-[260px] mx-auto">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-lg bg-muted/30 animate-pulse border border-primary/20"
            style={{
              width: 96,
              height: 134,
              top: `${10 + (i % 2) * 35}%`,
              left: `${8 + i * 16}%`,
              transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
            }}
          />
        ))}
      </div>
    );
  }

  // Mobile: clean 3-up grid
  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {visible.map((m) => {
          const up = m.change >= 0;
          return (
            <div
              key={m.key}
              className="relative overflow-hidden rounded-lg border border-primary/20 bg-muted/30"
            >
              <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm font-mono text-[8px] font-bold tracking-wider text-primary">
                {m.label}
              </div>
              <div
                className={`absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold ${
                  up ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                }`}
              >
                {up ? "+" : ""}
                {m.change.toFixed(1)}%
              </div>
              <div className="aspect-[3/4] w-full overflow-hidden bg-muted/50">
                <img
                  src={m.image}
                  alt={`${m.name} — top ${m.label.toLowerCase()} mover`}
                  loading="lazy"
                  className="w-full h-full object-contain"
                  onError={() => markBad(m.image)}
                />
              </div>
              <div className="p-1.5 bg-background/60">
                <p className="text-[10px] font-semibold text-foreground truncate" title={m.name}>
                  {m.name}
                </p>
                {m.set && (
                  <p className="text-[8px] text-muted-foreground/80 truncate">{m.set}</p>
                )}
                <p className="text-[9px] text-muted-foreground truncate">
                  ${m.market.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: fanned collage
  const [hero, ...ring] = visible;
  const heroUp = hero.change >= 0;
  const ringSlots = [
    "absolute top-6 left-0 -rotate-12 w-24 z-10",
    "absolute top-6 right-0 rotate-12 w-24 z-10",
    "absolute top-0 left-1/2 -translate-x-1/2 -rotate-3 w-28 z-20",
    "absolute bottom-0 left-[14%] -rotate-6 w-20 z-30",
  ];

  return (
    <div className="relative w-full h-[260px] mx-auto overflow-hidden">
      {ring.map((m, i) => {
        const up = m.change >= 0;
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45 }}
            whileHover={{ y: -10, scale: 1.05, zIndex: 35 }}
            className={ringSlots[i]}
          >
            <div className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 bg-muted/40">
              <img
                src={m.image}
                alt={`${m.name} — ${m.label.toLowerCase()} mover`}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={() => markBad(m.image)}
              />
              <div
                className={`absolute top-1 right-1 px-1 py-0.5 rounded font-mono text-[8px] font-bold ${
                  up ? "bg-primary/90 text-primary-foreground" : "bg-destructive/90 text-destructive-foreground"
                }`}
              >
                {up ? "+" : ""}
                {m.change.toFixed(1)}%
              </div>
            </div>
          </motion.div>
        );
      })}

      <motion.div
        key={hero.key}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        whileHover={{ scale: 1.06 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-1 w-36 z-40"
      >
        <div className="relative group">
          <div className="absolute inset-0 -z-10 bg-primary/40 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />
          <div
            className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden border-[3px] border-primary bg-muted/40"
            style={{ boxShadow: "0 0 60px hsl(158 72% 46% / 0.35)" }}
          >
            <img
              src={hero.image}
              alt={`${hero.name} — top mover`}
              loading="eager"
              className="w-full h-full object-cover"
              onError={() => markBad(hero.image)}
            />
            <div className="absolute bottom-0 inset-x-0 p-2 bg-black/85 backdrop-blur-md border-t border-white/15">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-wider truncate">
                  {hero.label}
                </span>
                <span
                  className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                    heroUp ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {heroUp ? "+" : ""}
                  {hero.change.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-1">
                <span className="text-[10px] font-bold text-white truncate">{hero.name}</span>
                <span className="text-sm font-black text-white shrink-0">
                  ${hero.market.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroTopMovers;
