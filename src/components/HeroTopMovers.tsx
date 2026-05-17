import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLiveCards } from "@/hooks/usePokemonTcg";
import { useGradedCards } from "@/hooks/useGradedCards";
import { useSealedProducts } from "@/hooks/useSealedProducts";

const FALLBACK_IMG = "/icon-192.png";

type Mover = {
  label: string;
  name: string;
  set?: string;
  market: number;
  change: number;
  image: string;
};

function pickTop<T extends { change?: number; _image?: string; image?: string; name: string; set?: string; market?: number }>(
  list: T[] | undefined
): T | null {
  if (!list || list.length === 0) return null;
  return [...list].sort(
    (a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0)
  )[0];
}

const HeroTopMovers = () => {
  const { data: rawCards } = useLiveCards();
  const gradedCards = useGradedCards(rawCards);
  const sealedProducts = useSealedProducts(rawCards);

  const movers = useMemo<Mover[]>(() => {
    const top = (label: string, c: any): Mover | null =>
      c
        ? {
            label,
            name: c.name,
            set: c.set,
            market: Number(c.market) || 0,
            change: Number(c.change) || 0,
            image: c._image || c.image || FALLBACK_IMG,
          }
        : null;
    return [
      top("RAW", pickTop(rawCards as any)),
      top("GRADED", pickTop(gradedCards as any)),
      top("SEALED", pickTop(sealedProducts as any)),
    ].filter(Boolean) as Mover[];
  }, [rawCards, gradedCards, sealedProducts]);

  if (movers.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {movers.map((m, i) => {
        const up = m.change >= 0;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
            className="relative overflow-hidden rounded-lg border border-primary/20 bg-muted/30 flex flex-col"
          >
            <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm font-mono text-[8px] sm:text-[9px] font-bold tracking-wider text-primary">
              {m.label}
            </div>
            <div
              className={`absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded font-mono text-[8px] sm:text-[9px] font-bold flex items-center gap-0.5 ${
                up ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
              }`}
            >
              {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {up ? "+" : ""}
              {m.change.toFixed(2)}%
            </div>
            <div className="aspect-[3/4] w-full bg-muted/50 flex items-center justify-center overflow-hidden">
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
            <div className="p-1.5 sm:p-2 bg-background/60">
              <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{m.name}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                ${m.market.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                {m.set ? ` · ${m.set}` : ""}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HeroTopMovers;
