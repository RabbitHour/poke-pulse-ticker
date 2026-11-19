import {useMemo,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useCatalog} from '@/hooks/useCatalog';
import {isEnglishArtwork} from '@/lib/collectorFocus';
import {CardImage} from '@/components/CardImage';

/** Browse the same exact English records used by valuation and saved-card tools. */
export default function SetBrowser(){
 const catalog=useCatalog();
 const [params,setParams]=useSearchParams();
 const selected=params.get('set')||'';
 const [query,setQuery]=useState('');
 const [page,setPage]=useState(0);
 const [failed,setFailed]=useState<Set<string>>(()=>new Set());
 const entries=useMemo(()=>(catalog.data?.entries??[]).filter(e=>e.kind==='raw'&&isEnglishArtwork(e)&&!failed.has(e.image)),[catalog.data,failed]);
 const sets=useMemo(()=>{
  const groups=new Map<string,{id:string;name:string;count:number;image:string}>();
  for(const e of entries){const group=groups.get(e.setId);if(group)group.count++;else groups.set(e.setId,{id:e.setId,name:e.set,count:1,image:e.image});}
  return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
 },[entries]);
 const set=sets.find(s=>s.id===selected);
 const matches=entries.filter(e=>e.setId===selected&&`${e.name} ${e.number} ${e.variant}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.number.localeCompare(b.number,'en',{numeric:true})||a.id.localeCompare(b.id));
 const pages=Math.max(1,Math.ceil(matches.length/36));
 const current=Math.min(page,pages-1);
 const choose=(id:string)=>{setParams(id?{set:id}:{});setQuery('');setPage(0);};
 return <main id="main-content" className="max-w-7xl mx-auto p-4 sm:p-8 space-y-5">
  <Link to="/" className="market-action">Back to daily check-in</Link>
  <section className="terminal-card p-5 space-y-3">
   <h1 className="text-2xl font-bold">{selected?set?.name||'Set unavailable':'Browse English sets'}</h1>
   <p>Explore exact printings, dated provider quotes and available English artwork. Counts are catalog variants with artwork, not completed sales or a complete set checklist.</p>
   <p className="text-sm">Source release: {catalog.data?.sourceUpdated||'Loading…'} · {selected?matches.length:sets.length} {selected?'matching variants':'available sets'}</p>
   {selected&&<button className="market-action" onClick={()=>choose('')}>All sets</button>}
   <label className="block">{selected?'Search this set':'Search sets'}<input className="block border border-border rounded p-3 w-full bg-background" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder={selected?'Name, number or variant':'Set name'}/></label>
  </section>
  {catalog.isLoading&&<p role="status">Loading catalog sets…</p>}
  {catalog.isError&&<p role="alert">The catalog is temporarily unavailable. <button className="underline" onClick={()=>catalog.refetch()}>Retry catalog</button></p>}
  {!selected?<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">{sets.filter(s=>s.name.toLowerCase().includes(query.toLowerCase())).map(s=><Link key={s.id} to={'/sets?set='+encodeURIComponent(s.id)} onClick={()=>{setPage(0);setQuery('');}} className="terminal-card p-3 space-y-2">
    <CardImage src={s.image} alt={s.name+' representative card'} className="w-full h-40 object-contain" onUnavailable={()=>setFailed(prev=>new Set(prev).add(s.image))}/><h2 className="font-bold">{s.name}</h2><p className="text-sm">{s.count} catalog variants</p>
   </Link>)}</div>:<><div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">{matches.slice(current*36,(current+1)*36).map(e=><Link key={e.id} to={'/catalog/'+encodeURIComponent(e.id)} className="terminal-card p-3 space-y-2">
    <CardImage src={e.image} alt={e.name} className="w-full h-44 object-contain" onUnavailable={()=>setFailed(prev=>new Set(prev).add(e.image))}/><h2 className="font-bold">{e.name}</h2><p className="text-sm">#{e.number} · {e.variant}</p><p className="font-bold">{e.market!=null?'$'+e.market.toFixed(2):'Quote unavailable'}</p>
   </Link>)}</div>{!matches.length&&!catalog.isLoading&&<p>No matching catalog variants with available English artwork. <button className="underline" onClick={()=>choose('')}>Browse other sets</button></p>}
   {pages>1&&<nav aria-label="Set card pages" className="flex justify-center gap-4"><button className="market-action" disabled={current===0} onClick={()=>setPage(current-1)}>Previous</button><span>{current+1} / {pages}</span><button className="market-action" disabled={current+1>=pages} onClick={()=>setPage(current+1)}>Next</button></nav>}</>}
  <p className="text-sm text-muted-foreground">Reference quotes are not verified completed sales. Match printing, variant and condition before comparing prices. Missing artwork is excluded here; the full catalog remains searchable.</p>
 </main>;
}
