import PokeHelp from "./PokeHelp";
import { ChartCandlestick } from "lucide-react";
import {ebayAffiliateLink} from "@/lib/ebay";
import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {useCatalog} from "@/hooks/useCatalog";
import {catalogSymbol} from "@/lib/catalogSymbols";
import {CardImage} from "./CardImage";
export default function MarketOpening(){const catalog=useCatalog();const [epoch,setEpoch]=useState(Math.floor(Date.now()/1800000));
 useEffect(()=>{const t=setInterval(()=>setEpoch(Math.floor(Date.now()/1800000)),30000);return()=>clearInterval(t);},[]);
 const cards = useMemo(() => {
   const priced = (catalog.data?.entries ?? []).filter(
     entry => entry.kind === "raw" && entry.image && entry.market != null && Number.isFinite(entry.market) && entry.market > 0,
   );
   const seen = new Set<string>();
   return priced.sort((a, b) => b.market! - a.market!).filter(entry => {
     const key = entry.cardId || entry.id;
     if (seen.has(key)) return false;
     seen.add(key);
     return true;
   });
 }, [catalog.data]);
 const spotlight = cards.length ? cards[epoch % cards.length] : undefined;
 return <section className="market-opening" aria-labelledby="opening-title"><div className="opening-copy"><span className="opening-mark"><ChartCandlestick aria-hidden="true" /></span>
 <h1 id="opening-title">Poke Pulse Ticker</h1>
 <p className="opening-kicker">Collector Market Terminal</p>
 <p className="text-muted-foreground">Find a card, slab, or sealed product.</p>
 <nav aria-label="Market shortcuts" className="flex flex-wrap justify-center gap-2">
   <a className="market-action opening-primary" href="#card-valuer">Check a card value</a>
   <a className="market-action" href="#catalog">Search catalog</a>
   <a className="market-action" href="#market-charts">Market charts</a>
   <Link className="market-action" to="/account">Create a free account</Link>
 </nav></div>
 <PokeHelp />
 <p className="text-center text-sm text-muted-foreground">Featured quotes · eBay affiliate links may earn us a commission.</p>
 <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
 <section className="terminal-card p-3">
   <h2 className="font-bold">Rotating card spotlight</h2>
   {spotlight ? <Link className="block" to={"/catalog/" + encodeURIComponent(spotlight.id)}>
     <CardImage src={spotlight.image} alt={spotlight.name} className="mx-auto w-full max-h-56 object-contain" />
     <strong>{spotlight.name}</strong>
     <p className="text-sm">{spotlight.set} · #{spotlight.number} {spotlight.variant}</p>
     <p className="text-sm">Provider quote: ${spotlight.market?.toFixed(2)}</p>
     <p className="text-xs">{spotlight.sourceUpdated || "Quote date unavailable"} · View quote and history</p>
   </Link> : <p className="text-sm">Waiting for catalog quotes.</p>}
 </section>
 <section className="min-w-0">
 <h2 className="font-bold">Highest quoted raw cards with artwork</h2>
 <p className="text-xs mb-2">Ranked by available provider quote, one result per card record group.</p>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{cards.slice(0,6).map(c=><a className="opening-card" key={c.id} href={ebayAffiliateLink(`Pokemon ${c.name} ${c.set} ${c.number} ${c.variant||""}`,"opening-gallery")} target="_blank" rel="sponsored noopener noreferrer" title="Find this card on eBay · affiliate link"><CardImage src={c.image} alt={c.name} className="w-full aspect-[3/4] object-contain"/><div className="p-2"><span className="text-[10px] text-primary font-mono">{catalogSymbol(c)}</span><strong className="block text-xs truncate">{c.name}</strong><span className="text-sm font-bold">{c.market==null?'No quote':'$'+c.market.toFixed(2)}</span></div></a>)}</div>{!cards.length && <p className="text-sm">No ranked quotes available yet.</p>}</section></div></section>;
}
