import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";
import { loadYesterdayObservations, rankYesterdayMovers } from "@/lib/yesterdayMovers";
import { CardImage } from "./CardImage";

const REFRESH = 30 * 60 * 1000;
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function DatedMovers() {
  const catalog = useCatalog();
  const [unavailable,setUnavailable] = useState<Set<string>>(()=>new Set());
  const observations = useQuery({
    queryKey: ["yesterday-exact-observations"],
    queryFn: () => loadYesterdayObservations(),
    staleTime: REFRESH,
    refetchInterval: REFRESH,
    retry: 1,
    placeholderData: previous => previous,
  });
  const movers = useMemo(() =>
    rankYesterdayMovers(catalog.data?.entries ?? [], observations.data ?? [])
      .filter(mover => mover.entry.kind === "raw" && mover.entry.image && !unavailable.has(mover.entry.image)).slice(0, 12),
  [catalog.data, observations.data, unavailable]);
  return (
    <section className="terminal-card p-4 space-y-3" aria-labelledby="dated-movers-title">
      <h2 id="dated-movers-title" className="text-lg font-bold">Most Active Raw Cards</h2>
      <p className="text-sm text-muted-foreground">Ranked by absolute price change for the same printing between yesterday’s UTC source release and the preceding day. Prices are provider quotes in USD.</p>
      {movers.length === 0 ? (
        <p role="status" className="text-sm">{observations.isPending || catalog.isPending ? "Checking recorded quotes…" : "No comparable raw card moves for this window yet."}</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Source releases (UTC) <time dateTime={movers[0].from}>{movers[0].from.slice(0, 10)}</time> to <time dateTime={movers[0].to}>{movers[0].to.slice(0, 10)}</time></p>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {movers.map(({ entry, change, previous, price }) => (
              <li key={entry.id}>
                <Link to={"/catalog/" + encodeURIComponent(entry.id)} className="flex flex-col h-full items-center gap-3 rounded-lg border border-border p-2 hover:border-primary">
                  <CardImage src={entry.image} alt={entry.name} highResolution onUnavailable={()=>setUnavailable(prev=>new Set(prev).add(entry.image))} className="h-48 w-32 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{[entry.set, entry.number, entry.variant].filter(Boolean).join(" · ")}</p>
                    <p className="text-sm">{dollars.format(previous)} → {dollars.format(price)}</p>
                    <p className={change > 0 ? "text-primary font-semibold" : "text-destructive font-semibold"}>{change > 0 ? "Up " : "Down "}{Math.abs(change).toFixed(2)}%</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
