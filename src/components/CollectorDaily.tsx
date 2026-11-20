import {useCatalogValueRanks} from '@/hooks/useCatalogValueRanks';
import {useSelectionRotation} from '@/hooks/useSelectionRotation';
import SectionArtwork from './SectionArtwork';
import {COLLECTOR_STORAGE,readCollectorSaved,type CollectorSaved} from '@/lib/collectorSaved';
import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {useCatalog} from '@/hooks/useCatalog';
import {loadYesterdayObservations} from '@/lib/yesterdayMovers';
import {comparableCatalogEntries} from '@/lib/marketCoverage';
import {isCollectorCard,collectorCategory,isEnglishArtwork} from '@/lib/collectorFocus';
import {CardImage} from './CardImage';
const STORAGE=COLLECTOR_STORAGE;
type Saved=CollectorSaved;
const money=(v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);
export default function CollectorDaily(){
 const catalog=useCatalog();
 const valueRanks=useCatalogValueRanks();
 const observations=useQuery({queryKey:['yesterday-exact-observations'],queryFn:()=>loadYesterdayObservations(),staleTime:1800000,refetchInterval:1800000,retry:1,placeholderData:prev=>prev});
 const [saved,setSaved]=useState<Saved[]>(readCollectorSaved);
 const [storageError,setStorageError]=useState(false);
 const [failed,setFailed]=useState<Set<string>>(()=>new Set());
 const [filter,setFilter]=useState('movers');
 const [movePage,setMovePage]=useState(0);
 const [previousVisit]=useState<{source:string;prices:Record<string,number>}|null>(()=>{try{return JSON.parse(localStorage.getItem(STORAGE+'-visit')||'null');}catch{return null;}});
 const [marked,setMarked]=useState(false);
 useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(saved));setStorageError(false);}catch{setStorageError(true);}},[saved]);
 const eligible=useMemo(()=>(catalog.data?.entries??[]).filter(e=>isCollectorCard(e)&&!failed.has(e.image)),[catalog.data,failed]);
 const comparable=useMemo(()=>comparableCatalogEntries(eligible,observations.data??[],catalog.data?.sourceUpdated??''),[eligible,observations.data,catalog.data?.sourceUpdated]);
 const rows=useMemo(()=>{
  const pool=comparable.filter(x=>filter==='gainers'?x.change>0:filter==='decliners'?x.change<0:true);
  return [...pool].sort((a,b)=>Math.abs(b.entry.market!-b.entry.market!/(1+b.change/100))-Math.abs(a.entry.market!-a.entry.market!/(1+a.change/100)));
 },[comparable,filter]);
 const rotation=useSelectionRotation(()=>setMovePage(p=>(p+1)%Math.max(1,Math.ceil(rows.length/6))));
 const setRows=useMemo(()=>{
  const releases=[...(observations.data??[])].sort((a,b)=>Date.parse(a.sourceUpdated)-Date.parse(b.sourceUpdated));
  const latest=releases[releases.length-1];
  const previousDay=latest?new Date(Date.parse(latest.sourceUpdated)-86400000).toISOString().slice(0,10):'';
  const previous=releases.filter(r=>r.sourceUpdated.slice(0,10)===previousDay);
  const before=previous[previous.length-1];
  if(!latest||!before||Date.parse(latest.sourceUpdated)!==Date.parse(catalog.data?.sourceUpdated??'')||new Date(Date.parse(latest.sourceUpdated)-86400000).toISOString().slice(0,10)!==before.sourceUpdated.slice(0,10))return [];
  const names=new Map((catalog.data?.entries??[]).filter(e=>e.kind==='raw').map(e=>[e.setId,e.set]));
  return Object.entries(latest.prices).filter(([id,value])=>id.startsWith('set:')&&value>0&&before.prices[id]>0&&names.has(id.slice(4))).map(([id,value])=>({id,name:names.get(id.slice(4))!,value,change:(value/before.prices[id]-1)*100})).sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));
 },[observations.data,catalog.data]);
 const illustratedSets=useMemo(()=>new Set((catalog.data?.entries??[]).filter(e=>e.kind==='raw'&&isEnglishArtwork(e)).map(e=>e.setId)),[catalog.data]);
 const toggle=(id:string)=>setSaved(prev=>prev.some(x=>x.id===id)?prev.filter(x=>x.id!==id):prev.length<50?[...prev,{id,target:''}]:prev);
 const source=catalog.data?.sourceUpdated;
 const savedQuotes=useMemo(()=>new Map((catalog.data?.entries??[]).filter(e=>e.kind!=='digital'&&e.market!=null).map(e=>[e.id,e])),[catalog.data]);
 const stale=source&&Date.now()-Date.parse(source)>72*3600000;
 function markReviewed(){try{localStorage.setItem(STORAGE+'-visit',JSON.stringify({source,prices:Object.fromEntries([...savedQuotes.values()].map(e=>[e.id,e.market]))}));setMarked(true);}catch{setStorageError(true);}}
 return <section {...rotation.bindings} id="daily-pulse" className="terminal-card p-5 space-y-5 scroll-mt-20" aria-labelledby="daily-pulse-title">
  <div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm font-semibold text-primary">Your collector check-in</p><h2 id="daily-pulse-title" className="text-2xl font-bold">What changed. What to watch.</h2></div><a href="#my-pulse" className="browse-sets">My saved cards ({saved.length})</a></div>
  <p>Follow English chase cards, compare dated moves, and set a buy-price target. Start with the evidence, then inspect the exact printing and recent sales.</p>
  <p className="text-sm text-muted-foreground">Source release: {source??'Loading…'} · Daily price observations, not intraday trades.{stale?' This release is over 72 hours old.':''} {comparable.length.toLocaleString()} eligible cards have comparable quotes. {previousVisit?.source ? `Last reviewed: ${previousVisit.source}.`:'Mark a release reviewed to compare your next visit.'}</p>
  <div className="flex flex-wrap gap-2" aria-label="Collector movement filters">{[['movers','Largest dollar moves'],['gainers','Gainers'],['decliners','Decliners']].map(([value,label])=><button key={value} aria-pressed={filter===value} className="browse-sets" onClick={()=>{setFilter(value);setMovePage(0);}}>{label}</button>)}<button className="browse-sets" onClick={markReviewed} disabled={!source||marked}>{marked?'Release marked reviewed':'Mark this release reviewed'}</button></div>
  <div className="collector-card-grid">{rows.slice((movePage%Math.max(1,Math.ceil(rows.length/6)))*6,((movePage%Math.max(1,Math.ceil(rows.length/6)))+1)*6).map(({entry:e,change})=><article key={e.id} className="rounded-xl border border-border p-3 space-y-2">
   <Link to={'/catalog/'+encodeURIComponent(e.id)}><CardImage highResolution src={e.image} alt={e.name} className="w-full h-44 object-contain" onUnavailable={()=>setFailed(prev=>new Set(prev).add(e.image))}/><h3 className="font-bold mt-2">{e.name}</h3></Link>
   <p className="text-xs">{e.set} · #{e.number} · {e.variant}</p><p className="text-xs text-muted-foreground">{collectorCategory(e)}</p><p className="font-bold">{money(e.market!)}</p>{valueRanks.has(e.id)&&<Link className="text-xs underline" to="/rankings">Raw value rank #{valueRanks.get(e.id)!.rank.toLocaleString()}</Link>}<p className={change>=0?'text-emerald-800 font-semibold':'text-rose-800 font-semibold'}>{change>=0?'+':''}{change.toFixed(2)}% · {money(e.market!-e.market!/(1+change/100))}</p>
   <button className="browse-sets text-sm" onClick={()=>toggle(e.id)}>{saved.some(x=>x.id===e.id)?'Remove saved card':'Save card'}</button>
  </article>)}</div>
  {rows.length>6&&<div className="flex gap-3 items-center"><button className="browse-sets" onClick={()=>setMovePage(p=>(p+1)%Math.ceil(rows.length/6))}>Explore next ranked movers →</button><button className="browse-sets" aria-pressed={rotation.paused} onClick={()=>rotation.setPaused(p=>!p)}>{rotation.paused?"Resume mover rotation":"Pause mover rotation"}</button><button className="browse-sets" onClick={()=>setMovePage(0)}>Return to leaders</button><span className="text-sm">Ranked page {movePage%Math.ceil(rows.length/6)+1} of {Math.ceil(rows.length/6)} · same dated release. Pages rotate every two minutes when not interacting.</span></div>}
  {!rows.length&&<p>{catalog.isLoading||observations.isLoading?'Loading comparable collector cards…':'No eligible comparisons for this filter. Cards without verified rarity, artwork or matching dates are excluded.'}</p>}
  <div id="my-pulse" className="space-y-3 scroll-mt-20"><h3 className="text-xl font-bold">My saved cards & price targets</h3><p className="text-sm text-muted-foreground">Saved on this browser and domain, up to 50 exact records. Targets are checked when you open this page; no background notifications or cross-device sync.</p>{storageError&&<p role="alert">Browser storage is unavailable. Your changes may not survive closing this page.</p>}
   {!saved.length&&<div><p>Save a card above to build your daily checklist.</p><SectionArtwork context="your first saved card" /></div>}
   {saved.map(item=>{const e=savedQuotes.get(item.id);const before=previousVisit?.prices?.[item.id];const target=Number(item.target);return <div key={item.id} className="rounded-lg border border-border p-3 flex flex-wrap gap-4 items-center">
    {e?.image&&<Link to={"/catalog/"+encodeURIComponent(e.id)}><CardImage highResolution src={e.image} alt={e.name} className="w-16 h-24 object-contain"/></Link>}<div className="flex-1 min-w-40"><Link className="font-semibold underline" to={'/catalog/'+encodeURIComponent(item.id)}>{e?.name??item.label??'Saved exact record'}</Link><p className="text-xs">{e?`${e.set} · #${e.number} · ${e.variant}`: 'Current exact-record quote unavailable'}</p></div>
    <span>{e?money(e.market!):'Unavailable'}{e&&before>0&&<small className="block">{money(e.market!-before)} since reviewed</small>}</span>
    <label className="text-sm">Buy target ($)<input type="number" min="0.01" step="0.01" value={item.target} onChange={event=>setSaved(prev=>prev.map(x=>x.id===item.id?{...x,target:event.target.value}:x))} className="block w-28 rounded border border-border p-2 bg-background"/></label>
    {e&&target>0&&<strong>{e.market!<=target?'At or below target':'Above target'}</strong>}<button className="underline text-sm" onClick={()=>toggle(item.id)}>Remove</button>
   </div>;})}
  </div>
  <div className="space-y-3"><div className="flex justify-between gap-3"><h3 className="text-xl font-bold">Set index pulse</h3><Link to="/sets" className="underline">Browse sets</Link></div><p className="text-sm text-muted-foreground">Fixed launch baskets, equal-weight price relatives, starting at 100. Index points are not a complete set’s dollar value. Only fully covered archived baskets receive a point; daily comparisons require both releases. {setRows.length} comparable indexes. Illustrated highlights below; browse sets for broader coverage.</p><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{setRows.filter(s=>illustratedSets.has(s.id.slice(4))).slice(0,8).map(s=><div key={s.id} className="rounded-lg bg-muted p-3"><SectionArtwork context={s.name} setId={s.id.slice(4)} count={6}/><h4 className="font-semibold"><Link className="underline" to={"/sets?set="+encodeURIComponent(s.id.slice(4))}>{s.name}</Link></h4><p>{s.value.toFixed(2)} pts · {s.change>=0?'+':''}{s.change.toFixed(2)}%</p></div>)}</div>{!setRows.length&&<p>Comparable set index releases are not available yet.</p>}</div>
  <details><summary className="font-semibold cursor-pointer">Use Poke Pulse as an app</summary><p className="text-sm mt-2">On Android or desktop, choose Install app from your browser menu. On iPhone or iPad, use Safari → Share → Add to Home Screen. The installed web app uses this same site and updates when online. Open the same domain to retain this device’s saved cards.</p></details>
 </section>;
}
