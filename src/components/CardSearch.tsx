import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCardSearch } from "@/hooks/usePokemonTcg";
import { rawCards, gradedCards, sealedProducts } from "@/data/marketData";
import AffiliateLinks from "@/components/AffiliateLinks";
import { sanitizeSearchInput } from "@/hooks/useInputSanitizer";
import { Loader2, Search, X } from "lucide-react";

const CardSearch = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: liveResults, isLoading, isError } = useCardSearch(debounced.length >= 2 ? debounced : "");

  // Local fallback (instant, covers sealed + offline)
  const localResults = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    const raw = rawCards
      .filter(c => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q))
      .map(c => ({ ...c, category: "Raw" as const, image: "" as string, _apiId: "" }));
    const graded = gradedCards
      .filter(c => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q))
      .map(c => ({ ...c, category: "Graded" as const, image: "" as string, _apiId: "" }));
    const sealed = sealedProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({ ...p, set: p.type, number: "—", mid: 0, category: "Sealed" as const, image: "" as string, _apiId: "" }));
    return [...raw, ...graded, ...sealed];
  }, [debounced]);

  // Merge: live first, then local items not already represented
  const merged = useMemo(() => {
    const live = (liveResults ?? []).map((c: any) => ({
      _apiId: c._apiId,
      name: c.name,
      set: c.set,
      number: c.number,
      market: c.market,
      change: c.change ?? 0,
      image: c._image ?? "",
      category: "Live" as const,
    }));
    const seen = new Set(live.map(l => `${l.name}|${l.set}`.toLowerCase()));
    const extras = localResults.filter(l => !seen.has(`${l.name}|${l.set}`.toLowerCase()));
    return [...live, ...extras].slice(0, 20);
  }, [liveResults, localResults]);

  return (
    <div className="terminal-card overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold tracking-wide text-secondary uppercase mb-3">Search Cards & Products</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(sanitizeSearchInput(e.target.value))}
            placeholder="Search any Poké card or product..."
            className="w-full rounded border border-border bg-muted pl-8 pr-9 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Search cards and products"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {debounced.length > 0 && debounced.length < 2 && (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">Type at least 2 characters…</p>
        )}
      </div>

      {debounced.length >= 2 && isLoading && merged.length === 0 && (
        <div className="px-4 py-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="font-mono text-xs text-muted-foreground">Searching live market…</span>
        </div>
      )}

      {merged.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          {merged.map((item, i) => {
            const row = (
              <div className="data-row flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.image ? (
                    <img src={item.image} alt="" loading="lazy" className="h-12 w-9 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-12 w-9 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                        {item.category}
                      </span>
                      <span className="font-mono text-sm text-foreground font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.set} {item.number && item.number !== "—" ? `· #${item.number}` : ""}</span>
                  </div>
                </div>
                <div className="text-right space-y-1 flex-shrink-0">
                  <div>
                    <span className="font-mono text-sm text-foreground">
                      ${item.market.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {typeof item.change === "number" && item.change !== 0 && (
                      <span className={`font-mono text-xs ml-2 font-semibold ${item.change >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                        {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <AffiliateLinks cardName={item.name} setName={item.set} compact />
                </div>
              </div>
            );
            return item._apiId ? (
              <Link key={`${item._apiId}-${i}`} to={`/card/${item._apiId}`} className="block hover:bg-muted/40 transition-colors">
                {row}
              </Link>
            ) : (
              <div key={`${item.name}-${i}`}>{row}</div>
            );
          })}
        </div>
      )}

      {debounced.length >= 2 && !isLoading && merged.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="font-mono text-sm text-muted-foreground">No results for "{debounced}"</p>
          {isError && <p className="font-mono text-[10px] text-terminal-amber mt-1">Live market temporarily unavailable — try again in a moment.</p>}
        </div>
      )}
    </div>
  );
};

export default CardSearch;
