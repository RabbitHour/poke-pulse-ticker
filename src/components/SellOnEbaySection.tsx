import { useMemo, useState } from "react";
import { ExternalLink, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveCards } from "@/hooks/usePokemonTcg";
import { ebayAffiliateLink } from "@/lib/ebay";
import { supabase } from "@/integrations/supabase/client";

// Block placeholder / card-back / generic images.
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

const PAGE_SIZE = 12;

/**
 * "Sell on eBay" — every card row passes the user to eBay search via the
 * Poke-Pulse EPN affiliate link, earning commission on any sale. Prices shown
 * are the LIVE TCGplayer market value from the same record as the image
 * (no synthetic graded multipliers, no static fallback). If live pricing is
 * unavailable, the section renders nothing rather than show stale numbers.
 */
const SellOnEbaySection = () => {
  const { data: rawCards, isLoading } = useLiveCards();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const sellable = useMemo(() => {
    if (!rawCards) return [];
    return (rawCards as any[]).filter(
      (c) =>
        c?._apiId &&
        c?._image &&
        !isBadImageUrl(c._image) &&
        Number(c.market) > 0,
    );
  }, [rawCards]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? sellable.filter(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.set?.toLowerCase().includes(q) ||
            c.number?.toLowerCase().includes(q),
        )
      : sellable;
    // Sort by highest market value first — best commission potential.
    return [...base].sort((a, b) => (b.market ?? 0) - (a.market ?? 0));
  }, [sellable, query]);

  const visible = filtered.slice(0, (page + 1) * PAGE_SIZE);

  const trackClick = (cardName: string, cardSet: string) => {
    // Fire-and-forget affiliate click logging.
    supabase
      .from("affiliate_clicks")
      .insert({
        partner: "ebay",
        card_name: cardName,
        card_set: cardSet,
      })
      .then(() => {});
  };

  const handleSell = (c: any) => {
    const q = `${c.name} ${c.set || ""} ${c.number ? `#${c.number}` : ""} pokemon`.trim();
    const url = ebayAffiliateLink(q, "sell-cards-section");
    trackClick(c.name, c.set || "");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <section className="rounded-lg border border-primary/20 bg-card/50 p-3">
        <h2 className="font-mono text-xs font-bold text-primary mb-2">
          SELL ON EBAY — Loading live TCG prices…
        </h2>
      </section>
    );
  }

  if (sellable.length === 0) return null;

  return (
    <section className="rounded-lg border border-primary/20 bg-card/50 p-3">
      <header className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div>
          <h2 className="font-mono text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            SELL ON EBAY · LIVE TCG PRICING
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            One-click list any card on eBay. Prices below are live TCGplayer market
            values — same record as the image.
          </p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search any card…"
            className="h-7 pl-7 text-[11px] bg-background/60"
          />
        </div>
      </header>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {visible.map((c) => {
          const change = Number(c.change) || 0;
          const up = change >= 0;
          return (
            <li
              key={c._apiId}
              className="group flex flex-col rounded-md border border-border/60 bg-background/50 overflow-hidden hover:border-primary/60 transition-colors"
            >
              <div className="relative aspect-[2.5/3.5] bg-muted/40 overflow-hidden">
                <img
                  src={c._image}
                  alt={`${c.name} — sell on eBay`}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform"
                />
                {change !== 0 && (
                  <span
                    className={`absolute top-1 right-1 px-1 py-0.5 rounded font-mono text-[8px] font-bold ${
                      up
                        ? "bg-primary/90 text-primary-foreground"
                        : "bg-destructive/90 text-destructive-foreground"
                    }`}
                  >
                    {up ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="p-1.5 flex flex-col gap-1">
                <p
                  className="text-[10px] font-semibold text-foreground truncate"
                  title={c.name}
                >
                  {c.name}
                </p>
                {c.set && (
                  <p className="text-[9px] text-muted-foreground truncate">{c.set}</p>
                )}
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-[9px] text-muted-foreground">TCG mkt</span>
                  <span className="text-xs font-black text-primary tabular-nums">
                    ${Number(c.market).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <Button
                  onClick={() => handleSell(c)}
                  size="sm"
                  className="h-6 text-[10px] mt-1 gap-1"
                >
                  Sell on eBay
                  <ExternalLink className="w-2.5 h-2.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {visible.length < filtered.length && (
        <div className="flex justify-center mt-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => setPage((p) => p + 1)}
          >
            Show more ({filtered.length - visible.length} more)
          </Button>
        </div>
      )}

      <p className="mt-2 text-[8px] text-muted-foreground/70 text-center">
        Poke-Pulse earns an eBay Partner Network commission on qualifying sales.
        Pricing pulled live from TCGplayer; no synthetic or stale values shown.
      </p>
    </section>
  );
};

export default SellOnEbaySection;
