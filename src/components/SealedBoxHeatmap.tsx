import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp, TrendingUp, TrendingDown, X, Filter, Info } from "lucide-react";
import type { SealedProduct } from "@/data/marketData";
import InfoDialog from "./InfoDialog";

interface SealedBoxHeatmapProps {
  products: SealedProduct[];
}

interface EraPerf {
  key: string;
  era: string;
  type: string;
  market: number;
  change: number;
  low: number;
  spreadPct: number;
}

type FilterMode = "all" | "boxes" | "etbs" | "packs";
const LANDING_LIMIT = 24;
const EXPANDED_LIMIT = 80;

const FILTER_LABEL: Record<FilterMode, { label: string; types: string[] }> = {
  all:   { label: "All Sealed", types: [] },
  boxes: { label: "Booster Boxes 📦", types: ["Booster Box"] },
  etbs:  { label: "ETBs 🎁", types: ["ETB"] },
  packs: { label: "Packs 🃏", types: ["Booster Pack", "Blister"] },
};

const SealedBoxHeatmap = ({ products }: SealedBoxHeatmapProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<EraPerf | null>(null);
  const [filter, setFilter] = useState<FilterMode>("boxes");
  const [infoOpen, setInfoOpen] = useState(false);

  const all = useMemo<EraPerf[]>(() => {
    return products.map((p) => {
      // Extract era name (everything before the product type)
      const eraMatch = p.name.match(/^(.+?)\s+(Booster Box|Booster Pack|Elite Trainer Box|Blister Pack|Theme Deck)/);
      const era = eraMatch ? eraMatch[1] : p.name;
      const spread = p.market > 0 ? ((p.market - p.low) / p.market) * 100 : 0;
      return {
        key: `${p.name}-${p.type}-${p.market}`,
        era,
        type: p.type,
        market: p.market,
        change: p.change,
        low: p.low,
        spreadPct: spread,
      };
    });
  }, [products]);

  const filtered = useMemo(() => {
    const base = filter === "all" ? all : all.filter(p => FILTER_LABEL[filter].types.includes(p.type));
    return [...base].sort((a, b) => b.market - a.market);
  }, [all, filter]);

  const limit = expanded ? EXPANDED_LIMIT : LANDING_LIMIT;
  const view = filtered.slice(0, limit);
  const maxVal = Math.max(...view.map((p) => p.market), 1);

  const getColor = (change: number) => {
    if (change > 3) return "bg-emerald-800 text-white";
    if (change > 0) return "bg-emerald-200 text-emerald-950";
    if (change === 0) return "bg-slate-200 text-slate-950";
    if (change > -3) return "bg-rose-200 text-rose-950";
    return "bg-rose-800 text-white";
  };

  const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(0)}`;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        aria-labelledby="sealed-heatmap-title"
      >
        <div className="terminal-card overflow-hidden">
          {/* Header */}
          <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <h3 id="sealed-heatmap-title" className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Sealed Box Performance Heatmap
              <button
                onClick={() => setInfoOpen(true)}
                className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label="What is the sealed box heatmap?"
              >
                <Info className="w-3 h-3" />
              </button>
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[8px] text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
                BOOSTER BOX INDEX
              </span>
              <span className="font-mono text-[8px] text-primary">
                {filtered.length} / {all.length} SKUs
              </span>
            </div>
          </div>

          {/* Filter chips */}
          <div className="border-b border-border/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto" role="toolbar" aria-label="Sealed product filters">
            <Filter className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
            {(Object.keys(FILTER_LABEL) as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setFilter(mode); setSelected(null); }}
                aria-pressed={filter === mode}
                className={`font-mono text-[9px] px-2 py-1 rounded border whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  filter === mode
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {FILTER_LABEL[mode].label}
              </button>
            ))}
          </div>

          {/* Heatmap grid */}
          <div
            className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
            role="grid"
            aria-label={`${view.length} sealed products shown`}
          >
            {view.map((p) => {
              const sizeRatio = Math.max(0.5, p.market / maxVal);
              const isSel = selected?.era === p.era && selected?.type === p.type;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelected(isSel ? null : p)}
                  aria-pressed={isSel}
                  aria-label={`${p.era} ${p.type}, ${fmt(p.market)}, ${p.change >= 0 ? "up" : "down"} ${Math.abs(p.change).toFixed(1)} percent`}
                  className={`rounded-md border border-border/40 p-1.5 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-lg hover:z-10 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:z-20 ${getColor(p.change)} ${isSel ? "ring-1 ring-primary scale-105" : ""}`}
                  style={{ minHeight: `${100 + sizeRatio * 32}px` }}
                >
                  <span className="font-mono text-sm font-bold leading-snug whitespace-normal w-full">
                    {p.era}
                  </span>
                  <span className="font-mono text-[8px] sm:text-[9px] font-black">
                    {fmt(p.market)}
                  </span>
                  <span className="font-mono text-sm font-semibold">
                    {p.change >= 0 ? "+" : ""}{p.change.toFixed(1)}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={`${selected.era}-${selected.type}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-primary" />
                        {selected.era} · {selected.type}
                      </h4>
                      <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                        Live consensus across TCGPlayer, eBay sealed listings, and PriceCharting
                      </p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Close details">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="terminal-card p-2">
                      <p className="font-mono text-[7px] text-muted-foreground uppercase">Market</p>
                      <p className="font-mono text-sm font-black text-foreground">{fmt(selected.market)}</p>
                    </div>
                    <div className="terminal-card p-2">
                      <p className="font-mono text-[7px] text-muted-foreground uppercase">24h Δ</p>
                      <p className={`font-mono text-sm font-black ${selected.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {selected.change >= 0 ? "+" : ""}{selected.change.toFixed(2)}%
                      </p>
                    </div>
                    <div className="terminal-card p-2">
                      <p className="font-mono text-[7px] text-muted-foreground uppercase">Best Floor</p>
                      <p className="font-mono text-sm font-black text-foreground">{fmt(selected.low)}</p>
                    </div>
                    <div className="terminal-card p-2">
                      <p className="font-mono text-[7px] text-muted-foreground uppercase">Spread</p>
                      <p className="font-mono text-sm font-black text-amber-400">{selected.spreadPct.toFixed(1)}%</p>
                    </div>
                  </div>

                  <p className="mt-3 font-mono text-[10px] text-muted-foreground leading-relaxed">
                    Sealed {selected.type.toLowerCase()}s from <strong className="text-foreground">{selected.era}</strong> are
                    {selected.change >= 0 ? " trending up " : " cooling off "}
                    over the past 24 hours. Floor-to-market spread of {selected.spreadPct.toFixed(1)}% indicates
                    {selected.spreadPct > 15 ? " thin liquidity — opportunistic flips possible." : " healthy market depth."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="border-t border-border px-4 py-1.5 flex items-center justify-between">
            <span className="font-mono text-[8px] text-muted-foreground">
              Size = market price · Color = 24h Δ%
            </span>
            <div className="flex items-center gap-2">
              {filtered.length > LANDING_LIMIT && (
                <button
                  onClick={() => { setExpanded(!expanded); setSelected(null); }}
                  className="font-mono text-[9px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                >
                  {expanded ? (<>Show Less <ChevronUp className="w-3 h-3" /></>) : (<>Show All {filtered.length} <ChevronDown className="w-3 h-3" /></>)}
                </button>
              )}
              <span className="font-mono text-[8px] text-primary">SEALED 1000™</span>
            </div>
          </div>
        </div>
      </motion.section>

      <InfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        title="Sealed Box Heatmap"
        description="A real-time treemap of every Pokémon TCG sealed product we track — booster boxes, ETBs, blisters, and theme decks across 100+ eras."
      >
        <p>
          <strong className="text-foreground">Tile size</strong> = current market price.
          Bigger tiles = more expensive products (vintage Base Set boxes, modern crown jewels).
        </p>
        <p>
          <strong className="text-foreground">Tile color</strong> = 24-hour price change.
          Deep green = up &gt;4%. Deep red = down &gt;4%. Neutral = flat.
        </p>
        <p>
          <strong className="text-foreground">Filters</strong>: Switch between Booster Boxes, ETBs, or Packs to drill into the SKU class
          you actually trade. Default view is Booster Boxes — the cleanest signal for sealed-investing demand.
        </p>
        <p className="text-muted-foreground">
          Prices are blended from TCGPlayer sealed listings, eBay sold-comp medians (last 30 days),
          and PriceCharting box-grades — refreshed every 30 minutes via the consensus engine.
        </p>
      </InfoDialog>
    </>
  );
};

export default SealedBoxHeatmap;
