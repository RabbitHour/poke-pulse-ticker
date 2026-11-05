import { CATALOG_HREF, CATALOG_LABEL } from "@/lib/catalogNavigation";
import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {CardData} from "@/data/marketData";
import {useCatalog,type CatalogEntry} from "@/hooks/useCatalog";
import {useObservedProducts} from "@/hooks/useObservedProducts";
import {catalogSymbol} from "@/lib/catalogSymbols";
import {PRODUCT_CATEGORIES} from "@/lib/productCategories";
import {CardImage} from "./CardImage";
export default function TickerBar({cards=[]}:{cards?:CardData[];isLive?:boolean;lastUpdated?:number}){
 const q=useCatalog();const observed=useObservedProducts(cards);const [page,setPage]=useState(0);const [paused,setPaused]=useState(false);const [category,setCategory]=useState('raw');
 useEffect(()=>{if(paused)return;const t=setInterval(()=>setPage(p=>p+1),30000);return()=>clearInterval(t);},[paused]);
 const pool=useMemo(()=>{const fallback:CatalogEntry[]=cards.map(c=>({id:c._apiId||c.name,cardId:c._apiId,name:c.name,set:c.set,setId:c.setCode||c.set,number:c.number,kind:'raw',category:null,market:c.market,image:c._image||'',sourceUrl:'',sourceUpdated:null,variant:c._variant}));
 const graded:CatalogEntry[]=observed.graded.map(c=>({id:c.name+c.grade+c.set,name:c.name,set:c.set,setId:c.setCode||c.set,number:c.number,kind:'graded',grade:c.grade,category:null,market:c.market,image:c._image||'',sourceUrl:'',sourceUpdated:observed.gradedAt||null}));
 const entries=[...(q.data?.entries??fallback),...graded];return entries.filter(e=>category==='all'||(category==='raw'||category==='sealed'||category==='graded'||category==='digital'?e.kind===category:e.category===category));
 },[q.data,cards,observed.graded,category,observed.gradedAt]);
 const start=pool.length?(page*24)%pool.length:0;const slice=pool.slice(start,start+24);
 return <section className="market-tape" aria-label="Indexed market ticker"><div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"><div className="flex flex-wrap items-center gap-2"><strong className="text-xs">POKE MARKET TAPE</strong><label className="sr-only" htmlFor="tape-category">Ticker category</label><select id="tape-category" className="rounded border border-border bg-card p-1 text-xs" value={category} onChange={e=>{setCategory(e.target.value);setPage(0);}}><option value="all">All indexed products</option><option value="raw">Raw cards</option><option value="digital">TCG Pocket · digital</option><option value="graded">Graded quotes</option><option value="sealed">All sealed products</option>{PRODUCT_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><span className="text-xs text-muted-foreground">{pool.length.toLocaleString()} indexed · window {pool.length?start+1:0}–{start+slice.length}</span></div><div className="flex gap-3 text-xs"><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'Resume':'Pause'}</button><a href={CATALOG_HREF} className="underline">{CATALOG_LABEL}</a></div></div>
 {slice.length?<div className="overflow-x-auto"><div className="ticker-scroll flex w-max py-2" style={{animationPlayState:paused?'paused':'running',animationDuration:'120s'}}>{[...slice,...slice].map((e,i)=><div key={e.id+'-'+i} className="inline-flex items-center gap-2 border-r border-border px-4"><CardImage src={e.image} alt={e.name} className="w-10 h-14 object-contain"/><div className="text-xs"><strong className="block text-primary font-mono" title={e.id}>{catalogSymbol(e)}</strong>{e.kind==='raw'&&e.cardId?<Link to={'/card/'+encodeURIComponent(e.cardId)} tabIndex={i>=slice.length?-1:0}>{e.name}</Link>:<span>{e.name}</span>}<span className="block text-muted-foreground">{e.set} {e.grade}</span></div><strong className="text-sm whitespace-nowrap">{e.kind==='digital'?'DIGITAL':e.market==null?'No quote':'$'+e.market.toFixed(2)}</strong></div>)}</div></div>:<p className="px-4 py-2 text-sm">No records in this category yet.</p>}
 <p className="px-4 pb-2 text-[11px] text-muted-foreground">Catalog coverage is provider-specific, not every worldwide printing. Prices are available source quotes; missing prices are never zero.</p></section>;
}
