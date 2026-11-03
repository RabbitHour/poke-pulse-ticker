import PriceHistory from "./PriceHistory";
import { useCatalog } from "@/hooks/useCatalog";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveCards, useLiveCardsQuick, useCardSearch } from "@/hooks/usePokemonTcg";
import { useObservedProducts } from "@/hooks/useObservedProducts";
import { totalQuote } from "@/lib/valuation";
import { CardImage } from "./CardImage";

export default function CardValuer({ id, compact = false }: { id:string; compact?:boolean }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("raw");
  const [quantity, setQuantity] = useState("1");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  useEffect(() => { const t=setTimeout(() => setDebounced(query.trim()),400); return () => clearTimeout(t); },[query]);
  const catalog = useCatalog();
  const live = useLiveCards();
  const quick = useLiveCardsQuick();
  const search = useCardSearch(category === "raw" ? debounced : "");
  const observed = useObservedProducts(live.data);
  const rows = useMemo(() => {
    const fallbackRaw = (debounced.length >= 2 ? search.data ?? [] : (live.data?.length ? live.data : quick.data) ?? []).map(c => ({
      key:`raw:${c._apiId || `${c.name}:${c.set}:${c.number}`}:${c._variant ?? ""}`, name:c.name,
      detail:`${c.set} · #${c.number} · ${c._variant || "variant unspecified"}`, price:c.market,
      image:c._image, href:c._apiId ? `/card/${encodeURIComponent(c._apiId)}` : undefined,
    }));
    const needle = debounced.toLowerCase();
    const raw = catalog.data ? catalog.data.entries.filter(e => e.kind === "raw" && e.market != null && e.market > 0 && (!needle || `${e.name} ${e.set} ${e.number}`.toLowerCase().includes(needle))).map(e => ({key:e.id,name:e.name,detail:`${e.set} · #${e.number} · ${e.variant || "variant unspecified"}`,price:e.market!,image:e.image,href:e.cardId?"/card/"+encodeURIComponent(e.cardId):undefined})) : fallbackRaw;
    const graded = observed.graded.map(c => ({ key:`graded:${c.name}:${c.set}:${c.number}:${c.grade}`, name:c.name,
      detail:`${c.set} · #${c.number} · ${c.grade}`, price:c.market, image:c._image, href:undefined }));
    const fallbackSealed = observed.sealed.map(c => ({key:`sealed:${c.name}:${c.type}`, name:c.name,
      detail:c.type, price:c.market, image:c.image, href:undefined }));
    const sealed = catalog.data ? catalog.data.entries.filter(e => e.kind === "sealed" && e.market != null && e.market > 0).map(e => ({key:e.id,name:e.name,detail:e.set,price:e.market!,image:e.image,href:undefined})) : fallbackSealed;
    const q=debounced.toLowerCase();
    return (category === "raw" ? raw : category === "graded" ? graded : sealed)
      .filter(c => Number.isFinite(c.price) && c.price > 0 && (!q || `${c.name} ${c.detail}`.toLowerCase().includes(q)))
      .slice(0,compact ? 6 : 12);
  },[category,debounced,search.data,live.data,quick.data,observed.graded,observed.sealed,compact,catalog.data]);
  const selected = rows.find(r => r.key === selectedKey);
  const total = selected ? totalQuote(selected.price, Number(quantity)) : null;
  const busy = category === "raw" ? !catalog.data && (live.isLoading || (debounced.length >= 2 && search.isFetching)) : (category === "sealed" && catalog.data ? false : observed.isLoading);
  const failed = catalog.data && category !== "graded" ? false : category === "raw" ? (debounced.length >= 2 ? search.isError : live.isError) : observed.isError;
  function changeCategory(value:string) {setCategory(value);setSelectedKey(null);}
  return <section id={id} aria-labelledby={`${id}-title`} className="terminal-card bright-valuer p-4 sm:p-5 scroll-mt-20 space-y-3">
    <div className="flex items-center justify-between gap-3 flex-wrap"><h2 id={`${id}-title`} className="font-bold text-xl">Check your card or product value</h2><span className="text-xs font-semibold">FREE LOOKUP · USD</span></div>
    <p className="text-sm muted">Choose an exact result. Raw quotes depend on printing and condition; graded quotes are asking-price medians, not authenticated completed sales.</p>
    <div className="grid sm:grid-cols-[1fr_170px_100px] gap-3">
      <label className="text-sm">Card, set or number<input value={query} maxLength={100} onChange={e => {setQuery(e.target.value);setSelectedKey(null);}} placeholder="Try Charizard, 151, or a card number" /></label>
      <label className="text-sm">Category<select value={category} onChange={e => changeCategory(e.target.value)}><option value="raw">Raw cards</option><option value="graded">Graded cards</option><option value="sealed">Sealed products</option></select></label>
      <label className="text-sm">Quantity<input type="number" min={1} max={999} step={1} value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
    </div>
    <div className="text-xs muted" aria-live="polite">{busy ? "Checking available quotes…" : failed ? "The source could not be reached. Previously loaded results may still be shown." : `${rows.length} matching results shown.`} {category === "raw" && catalog.data ? `Source release: ${catalog.data.sourceUpdated}` : category === "graded" && observed.gradedAt ? `Snapshot: ${new Date(observed.gradedAt).toLocaleString()}` : category === "sealed" && observed.sealedAt ? `Source update: ${observed.sealedAt}` : "Raw feed checks every 30 minutes; provider price dates may be older."}</div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {rows.map(r => <button type="button" key={r.key} onClick={() => setSelectedKey(r.key)} aria-pressed={selectedKey === r.key}
        className={`flex gap-3 items-center p-3 rounded-lg border text-left ${selectedKey === r.key ? "bg-green-100 border-green-700 ring-2 ring-green-700" : "bg-white"}`}>
        <CardImage src={r.image} alt={r.name} className="w-16 h-24 shrink-0 object-contain" />
        <span className="min-w-0"><strong className="block text-sm">{r.name}</strong><span className="block text-xs muted">{r.detail}</span><strong className="block text-sm mt-1">${r.price.toFixed(2)}</strong></span>
      </button>)}
    </div>
    {!busy && !rows.length && <p role="status" className="text-sm">No matching source quote is available. Try a name or set, or another category. No price is guessed.</p>}
    {selected && <div className="valuer-result" aria-live="polite"><h3 className="font-semibold">{selected.name} — reference estimate</h3>
      <p className="text-3xl font-bold py-2">{total === null ? "Enter a whole quantity from 1 to 999" : `$${total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`}</p>
      <p className="text-xs muted">{category === "graded" ? "Active listing median; the picture may show raw card artwork, not a slab." : "Available feed quote; this is not an offer to buy or a guaranteed sale value."} Fees, shipping and taxes are excluded.</p>
      <PriceHistory recordId={selected.key} current={selected.price} />
      {selected.href && <Link className="market-action mt-2" to={selected.href}>Open card details</Link>}</div>}
    <div className="flex flex-wrap gap-3"><Link to="/sets" className="market-action">Browse sets</Link><a href="#market-charts" className="market-action">View market charts</a><a href="#poke-help" className="market-action">Ask Poke</a></div>
  </section>;
}
