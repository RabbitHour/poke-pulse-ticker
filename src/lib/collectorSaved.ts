export const COLLECTOR_STORAGE='poke-pulse-collector-v1';
export type CollectorSaved={id:string;target:string;label?:string};
export function readCollectorSaved():CollectorSaved[]{
 try{
  const current=localStorage.getItem(COLLECTOR_STORAGE);
  if(current){const rows=JSON.parse(current);return Array.isArray(rows)?rows.filter(x=>typeof x.id==='string'&&typeof x.target==='string').slice(0,50):[];}
  const legacy=JSON.parse(localStorage.getItem('pulse-watchlist')||'{}');
  return Object.entries(legacy).filter(([,label])=>typeof label==='string').slice(0,50).map(([id,label])=>({id,label:String(label),target:''}));
 }catch{return [];}
}
