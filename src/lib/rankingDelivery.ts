import {DURABLE_DATA_BASE,validHistory} from './forecastDelivery';
import {validObservation,type QuoteObservation} from './yesterdayMovers';
export async function loadRankingObservations(source:string,fetcher:typeof fetch=fetch):Promise<QuoteObservation[]>{
 const timestamp=Date.parse(source);if(!Number.isFinite(timestamp))return [];
 const dates=[new Date(timestamp).toISOString().slice(0,10),new Date(timestamp-86400000).toISOString().slice(0,10)];
 async function get(url:string){try{const r=await fetcher(url,{cache:'no-cache',signal:AbortSignal.timeout(20000)});return r.ok?await r.json():null;}catch{return null;}}
 const lists=await Promise.all(['/data/',DURABLE_DATA_BASE].map(async base=>{
  const manifest=await get(base+'history/manifest.json');if(!validHistory(manifest))return [];
  const days=manifest.days.filter(d=>Number.isFinite(Date.parse(d.sourceUpdated)) && dates.includes(new Date(d.sourceUpdated).toISOString().slice(0,10)));
  const snapshots=await Promise.all(days.map(async d=>{const value=await get(base+'history/'+d.file);return validObservation(value)&&value.sourceUpdated===d.sourceUpdated?value:null;}));
  return snapshots.filter((x):x is QuoteObservation=>x!==null);
 }));
 const observations=[...new Map(lists.flat().map(o=>[o.sourceUpdated,o])).values()];
 if(!observations.length)throw Error('Dated ranking comparisons are unavailable');
 return observations;
}
