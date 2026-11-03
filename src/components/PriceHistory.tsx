import {useQuery} from '@tanstack/react-query';
const periods=[1,2,3,4,5,6,7,14,30,60,90,180,365];
type Day={date:string;t:string;sourceUpdated:string;file:string};
export default function PriceHistory({recordId,current}:{recordId:string;current:number}){
 const q=useQuery({queryKey:['quote-history',recordId],queryFn:async()=>{
  const r=await fetch('/data/history/manifest.json',{cache:'no-cache'});if(!r.ok)throw Error('History unavailable');const m=await r.json() as {days:Day[]};
  const now=Date.now();const selected=periods.map(days=>{const target=now-days*86400000;return {days,day:[...m.days].reverse().find(d=>Date.parse(d.t)<=target&&target-Date.parse(d.t)<36*3600000)};});
  const files=[...new Set(selected.flatMap(s=>s.day?[s.day.file]:[]))];
  const loaded=new Map(await Promise.all(files.map(async file=>{if(!/^\d{4}-\d{2}-\d{2}\.json$/.test(file))throw Error('Invalid history filename');const r=await fetch('/data/history/'+file);if(!r.ok)throw Error('Snapshot unavailable');return [file,await r.json()] as const;})));
  return selected.map(s=>({days:s.days,t:s.day?.t,price:s.day?loaded.get(s.day.file)?.prices[recordId] as number|undefined:undefined}));
 },staleTime:1800000,retry:1});
 return <div className="mt-4 border-t border-green-200 pt-3"><h4 className="font-bold">Your price timeline</h4><p className="text-xs muted">Exact variant quotes saved after launch. Missing dates stay unavailable. Graded per-item history is not connected.</p>{q.isLoading?<p>Loading saved observations…</p>:q.isError?<p className="text-sm">No saved history is available for this item yet.</p>:<div className="price-history-grid">{q.data?.map(p=><div key={p.days}><span className="block text-xs">{p.days===365?'1 year':p.days+' days'} ago</span><strong className="block">{p.price!=null?'$'+p.price.toFixed(2):'Not recorded'}</strong>{p.price!=null&&<span className="text-xs">{((current/p.price-1)*100).toFixed(1)}% to today<br/>{p.t&&new Date(p.t).toLocaleDateString()}</span>}</div>)}</div>}</div>;
}
