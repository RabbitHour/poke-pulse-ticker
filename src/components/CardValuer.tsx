import PriceHistory from "./PriceHistory";
import { useCatalog } from "@/hooks/useCatalog";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveCards, useLiveCardsQuick, useCardSearch } from "@/hooks/usePokemonTcg";
import { useObservedProducts } from "@/hooks/useObservedProducts";
import { totalQuote } from "@/lib/valuation";
import { matchesCatalogQuery, catalogSearchText } from "@/lib/catalogSearch";
import { CardImage } from "./CardImage";

type Row = {key:string;name:string;detail:string;searchText:string;price:number|null;image?:string;href?:string};
export default function CardValuer({ id, compact = false }: {id:string;compact?:boolean}) {
  const [query,setQuery]=useState("");
  const [submitted,setSubmitted]=useState("");
  const [category,setCategory]=useState("raw");
  const [quantity,setQuantity]=useState("1");
  const [selectedKey,setSelectedKey]=useState<string|null>(null);
  useEffect(()=>{const timer=setTimeout(()=>setSubmitted(query.trim()),400);return()=>clearTimeout(timer);},[query]);
  const catalog=useCatalog();
  const live=useLiveCards();
  const quick=useLiveCardsQuick();
  const search=useCardSearch(!catalog.data && category==="raw" ? submitted : "");
  const observed=useObservedProducts(live.data);
  const allRows=useMemo<Row[]>(()=>{
    if (catalog.data && category!=="graded") return catalog.data.entries.filter(e=>e.kind===category).map(e=>({
      key:e.id,name:e.name,detail:[e.set,"#"+e.number,e.variant].filter(Boolean).join(" · "),
      searchText:catalogSearchText(e),price:e.market!=null && Number.isFinite(e.market) && e.market>0?e.market:null,
      image:e.image,href:"/catalog/"+encodeURIComponent(e.id),
    }));
    if(category==="sealed") return observed.sealed.map(c=>({key:"sealed:"+c.name,name:c.name,detail:c.type,searchText:c.name+" "+c.type,price:c.market,image:c.image}));
    const pool=category==="graded"?observed.graded:(submitted.length>=2?search.data:live.data?.length?live.data:quick.data)??[];
    return pool.map(c=>({key:c._apiId||[c.name,c.set,c.number,c.grade,c._variant].join(":"),name:c.name,
      detail:[c.set,"#"+c.number,c.grade||c._variant].filter(Boolean).join(" · "),
      searchText:[c.name,c.set,c.number,c.grade,c._variant].filter(Boolean).join(" "),
      price:Number.isFinite(c.market)&&c.market>0?c.market:null,image:c._image,href:c._apiId?"/card/"+encodeURIComponent(c._apiId):undefined}));
  },[catalog.data,category,observed.graded,observed.sealed,submitted,search.data,live.data,quick.data]);
  const matches=useMemo(()=>allRows.filter(r=>matchesCatalogQuery(r.searchText,submitted)),[allRows,submitted]);
  const rows=matches.slice(0,compact?6:12);
  const selected=rows.find(r=>r.key===selectedKey);
  const total=selected?.price!=null?totalQuote(selected.price,Number(quantity)):null;
  const busy=category==="graded"?observed.isLoading:catalog.isLoading || (!catalog.data && search.isFetching);
  const failed=category==="graded"?observed.isError:catalog.isError;
  return <section id={id} aria-labelledby={id+"-title"} className="terminal-card bright-valuer p-4 sm:p-5 scroll-mt-20 space-y-3">
    <div className="flex items-center justify-between gap-3 flex-wrap"><h2 id={id+"-title"} className="font-bold text-xl">Check a card value</h2><span className="text-xs font-semibold">FREE LOOKUP · USD</span></div>
    <p className="text-sm muted">Search by Pokémon, set, card number or variant. Select your exact printing before using its quote. Graded prices are asking-price medians.</p>
    <form aria-label="Card value search" onSubmit={e=>{e.preventDefault();setSubmitted(query.trim());setSelectedKey(null);}}>
      <div className="grid sm:grid-cols-[1fr_170px_100px] gap-3">
        <label className="text-sm" htmlFor={id+"-query"}>Card, set or number<input id={id+"-query"} value={query} maxLength={100} onChange={e=>{setQuery(e.target.value);setSelectedKey(null);}} placeholder="Try Mew 30th Anniversary or Charizard 4/102"/></label>
        <label className="text-sm">Category<select value={category} onChange={e=>{setCategory(e.target.value);setSelectedKey(null);}}><option value="raw">Raw cards</option><option value="graded">Graded cards</option><option value="sealed">Sealed products</option></select></label>
        <label className="text-sm">Quantity<input type="number" min={1} max={999} step={1} value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
      </div>
      <button type="submit" className="market-action mt-3">Search values</button>
    </form>
    <div role="status" className="text-xs muted">{busy?"Loading available records…":matches.length+" matching records · showing "+rows.length+". "}{catalog.data?"Source release: "+catalog.data.sourceUpdated:""}</div>
    {failed&&<div role="alert"><p>The catalog service could not be reached. Any fallback results have limited coverage.</p><button className="market-action" onClick={()=>void catalog.refetch()}>Retry catalog</button></div>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {rows.map(r=><button type="button" key={r.key} onClick={()=>setSelectedKey(r.key)} aria-pressed={selectedKey===r.key}
        className={"flex gap-3 items-center p-3 rounded-lg border text-left "+(selectedKey===r.key?"bg-green-100 border-green-700 ring-2 ring-green-700":"bg-white")}>
        <CardImage src={r.image} alt={r.name} className="w-16 h-24 shrink-0 object-contain"/>
        <span className="min-w-0"><strong className="block text-sm">{r.name}</strong><span className="block text-xs muted">{r.detail}</span><strong className="block text-sm mt-1">{r.price==null?"Price unavailable":"$"+r.price.toFixed(2)}</strong></span>
      </button>)}
    </div>
    {!busy&&!rows.length&&<p role="status">No exact catalog match for “{submitted}”. Try the Pokémon name and printed card number, then check the set, language and variant. Some languages, promos and new releases are not covered yet. No price is guessed.</p>}
    {matches.length>rows.length&&<Link className="market-action" to={"/?q="+encodeURIComponent(submitted)+"#catalog-search"}>See all matching catalog records</Link>}
    {selected&&<div className="valuer-result" aria-live="polite"><h3 className="font-semibold">{selected.name} — {selected.detail}</h3>
      <p className="text-3xl font-bold py-2">{selected.price==null?"No provider quote yet":total==null?"Enter a whole quantity from 1 to 999":"$"+total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
      <p className="text-xs muted">Available feed quote, not an offer to buy or a guaranteed sale value. Fees, shipping and taxes are excluded.</p>
      {selected.price!=null&&<PriceHistory recordId={selected.key} current={selected.price}/>}
      {selected.href&&<Link className="market-action mt-2" to={selected.href}>Open card details</Link>}
    </div>}
    <p className="text-xs muted">Coverage is provider-specific. A missing price does not mean the card is worthless.</p>
  </section>;
}
