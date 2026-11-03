import { useMarketIndexes } from "@/hooks/useMarketIndexes";
import IndexDayChart from "./IndexDayChart";

const groups = [
  { type: "raw", title: "Raw card market", variant: "green", description: "Ungraded cards • TCGplayer via TCGCSV" },
  { type: "graded", title: "Graded card market", variant: "amber", description: "Available PSA 10 asking-price medians • not sold values" },
  { type: "sealed", title: "Sealed product market", variant: "blue", description: "Boxes, packs & collections • TCGplayer via TCGCSV" },
] as const;

export default function MarketOverview() {
  const { indexes, isLoading, isError, refetch } = useMarketIndexes();
  return <section id="market-charts" aria-labelledby="market-charts-title" className="space-y-3 scroll-mt-20">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="market-charts-title" className="market-section-title">Core market indexes</h2>
        <p className="text-sm text-muted-foreground">Stored basket-average prices in USD. The chart checks for new records every five minutes; provider updates may be daily.</p></div>
      <button className="market-action" onClick={() => void refetch()} disabled={isLoading}>Refresh charts</button>
    </div>
    {isError && <p role="alert" className="market-note">Market history could not be loaded. Check the backend connection and read access. Existing observations remain visible when available.</p>}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      {groups.map(g => { const index = indexes[g.type];
        const stale = index && Date.now() - Date.parse(index.capturedAt) > 36 * 3600_000;
        return <div key={g.type} className="min-w-0 space-y-2">
          <div className="terminal-card p-4 border-t-2" style={{borderTopColor:g.variant === "green" ? "#34d399" : g.variant === "amber" ? "#fbbf24" : "#60a5fa"}}>
            <h3 className="font-bold text-base">{g.title}</h3><p className="text-xs text-muted-foreground mt-1">{g.description}</p>
            <p className="text-xs mt-2">{index ? `${index.constituents.toLocaleString()} observed constituents` : "Coverage unavailable"}</p>
            <p className="text-xs text-muted-foreground">{index ? `Last snapshot: ${new Date(index.capturedAt).toLocaleString()}` : isLoading ? "Loading history…" : "No snapshot returned"}{stale ? " • STALE" : ""}</p>
          </div>
          <IndexDayChart title={g.title} variant={g.variant} index={index} isLoading={isLoading} />
        </div>;
      })}
    </div>
    <p className="text-xs text-muted-foreground">Basket membership can change. These averages are not market capitalization or a fixed-constituent investment index. A line appears only when real history is available.</p>
  </section>;
}
