import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLiveCards } from "@/hooks/usePokemonTcg";
import { useGradedCards } from "@/hooks/useGradedCards";
import { useSealedProducts } from "@/hooks/useSealedProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import { rawCards as fallbackRaw, gradedCards as fallbackGraded, sealedProducts as fallbackSealed } from "@/data/marketData";

const FALLBACK_IMG = "/icon-192.png";

type Mover = {
  label: string;
  name: string;
  set?: string;
  market: number;
  change: number;
  image: string;
};

function topN<T extends { change?: number; _image?: string; image?: string }>(
  list: T[] | undefined,
  n: number
): T[] {
  if (!list || list.length === 0) return [];
  return [...list]
    .filter((c) => Boolean(c._image || c.image))
    .sort((a, b) => Math.abs((b.change ?? 0)) - Math.abs((a.change ?? 0)))
    .slice(0, n);
}

const toMover = (label: string, c: any): Mover | null =>
  c && (c._image || c.image)
    ? {
        label,
        name: c.name,
        set: c.set,
        market: Number(c.market) || 0,
        change: Number(c.change) || 0,
        image: c._image || c.image,
      }
    : null;

const HeroTopMovers = () => {
  const { data: rawCards } = useLiveCards();
  const gradedCards = useGradedCards(rawCards);
  const sealedProducts = useSealedProducts(rawCards);
  const isMobile = useIsMobile();

  const { hero, ring } = useMemo(() => {
    const rawList = (rawCards && rawCards.length > 0 ? rawCards : fallbackRaw) as any[];
    const gradedList = (gradedCards && gradedCards.length > 0 ? gradedCards : fallbackGraded) as any[];
    const sealedList = (sealedProducts && sealedProducts.length > 0 ? sealedProducts : fallbackSealed) as any[];

    const pool: Mover[] = [
      ...topN(rawList, 3).map((c) => toMover("RAW", c)!),
      ...topN(gradedList, 2).map((c) => toMover("GRADED", c)!),
      ...topN(sealedList, 2).map((c) => toMover("SEALED", c)!),
    ].filter(Boolean) as Mover[];

    const sorted = pool.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return { hero: sorted[0] || null, ring: sorted.slice(1, 5) };
  }, [rawCards, gradedCards, sealedProducts]);

  if (!hero) return null;

  // Mobile: compact 3-up grid with hero featured
  if (isMobile) {
    const compact = [hero, ...ring].slice(0, 3);
    return (
      <div className="grid grid-cols-3 gap-2">
        {compact.map((m, i) => {
          const up = m.change >= 0;
          return (
            <div
              key={`${m.label}-${i}`}
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
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>
              <div className="p-1.5 bg-background/60">
                <p className="text-[10px] font-semibold text-foreground truncate">{m.name}</p>
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

  // Desktop: fanned card collage
  const heroUp = hero.change >= 0;

  // 4 ring positions — kept within container bounds
  const ringSlots = [
    "absolute top-6 left-0 -rotate-12 w-24 z-10",                           // far-left back
    "absolute top-6 right-0 rotate-12 w-24 z-10",                           // far-right back
    "absolute top-0 left-1/2 -translate-x-1/2 -rotate-3 w-28 z-20",         // top slanted
    "absolute bottom-0 left-[14%] -rotate-6 w-20 z-30",                     // bottom floating
  ];

  return (
    <div className="relative w-full h-[260px] mx-auto overflow-hidden">

      {/* ring cards */}
      {ring.map((m, i) => {
        const up = m.change >= 0;
        return (
          <motion.div
            key={`ring-${i}`}
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
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                }}
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

      {/* hero centerpiece */}
      <motion.div
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
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
              }}
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
