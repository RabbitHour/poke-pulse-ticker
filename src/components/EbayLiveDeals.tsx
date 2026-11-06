import { useLiveCardsQuick } from "@/hooks/usePokemonTcg";
import { CardImage } from "./CardImage";

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function EbayLiveDeals() {
  const { data = [], isLoading } = useLiveCardsQuick();
  const cards = data.filter(card => card._image).slice(0, 6);

  return (
    <section className="terminal-card p-4 space-y-3">
      <h2 className="font-bold text-lg">Explore marketplace listings</h2>
      <p className="text-sm text-muted-foreground">Use the card’s set, number and printing to compare asking prices. Confirm condition and shipping on eBay.</p>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(card => {
          const query = encodeURIComponent([card.name, card.set, card.number, card._variant].filter(Boolean).join(" "));
          const url = "https://www.ebay.com/sch/i.html?_nkw=" + query;
          return (
            <article key={card._apiId} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <CardImage highResolution src={card._image} alt={card.name} className="h-32 w-24 shrink-0 object-contain" />
              <div className="min-w-0 space-y-1">
                <h3 className="font-semibold text-sm">{card.name}</h3>
                <p className="text-xs text-muted-foreground">{[card.set, card.number, card._variant].filter(Boolean).join(" · ")}</p>
                {Number.isFinite(card.market) && card.market > 0 && <p className="text-sm font-semibold">Reference quote {dollars.format(card.market)}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-primary">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline">Active listings ↗</a>
                  <a href={url + "&LH_Complete=1&LH_Sold=1"} target="_blank" rel="noopener noreferrer" className="underline">Sold listings ↗</a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {isLoading && <p role="status">Loading featured cards…</p>}
    </section>
  );
}
