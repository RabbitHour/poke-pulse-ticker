import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DAY,HORIZONS,eligibleOutcome} from '../src/lib/forecastRules.mjs';
export {DAY};
const read=async(p,f)=>{try{return JSON.parse(await fs.readFile(p,'utf8'));}catch(e){if(e.code==='ENOENT')return f;throw e;}};
async function atomic(p,d){await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p+'.tmp',JSON.stringify(d));await fs.rename(p+'.tmp',p);}
// Point-in-time forecast. Requires eight distinct daily observations spanning seven days.
export function predict(points,horizonDays=7){
 if(points.length<8||!HORIZONS.includes(horizonDays))return null;
 const recent=points.slice(-8),a=recent[0],b=recent.at(-1),days=(Date.parse(b.t)-Date.parse(a.t))/DAY;
 if(days<7||recent.some(p=>!Number.isFinite(p.v)||p.v<=0))return null;
 const value=b.v*Math.exp(Math.log(b.v/a.v)/days*horizonDays);
 return Number.isFinite(value)&&value>0?Math.round(value*100)/100:null;
}
export function score(f,actual){if(!Number.isFinite(actual)||actual<=0)return null;return {actual,absolutePercentError:Math.abs(f.predicted-actual)/actual*100,baselineAbsolutePercentError:Math.abs(f.baseline-actual)/actual*100};}
export async function recordHistory(publicDir,entries,sourceUpdated,observedAt){
 const dir=path.join(publicDir,'history');await fs.mkdir(dir,{recursive:true});
 const manifest=await read(path.join(dir,'manifest.json'),{version:1,days:[]});
 // Save at most one observation for a provider release. A repeat check is not a fresh price.
 if(manifest.days.some(d=>d.sourceUpdated===sourceUpdated))return;
 const date=observedAt.slice(0,10);if(manifest.days.some(d=>d.date===date))return;
 const setFile=path.join(dir,'set-baskets.json');
 const baskets=await read(setFile,{});
 const raw=entries.filter(e=>e.kind==='raw'&&e.setId&&Number.isFinite(e.market)&&e.market>0);
 for(const setId of new Set(raw.map(e=>e.setId))){if(!baskets[setId]){const rows=raw.filter(e=>e.setId===setId);baskets[setId]={name:rows[0].set,basket:rows.map(e=>({id:e.id,base:e.market}))};}}
 const quotes=new Map(entries.map(e=>[e.id,e.market]));
 const sets=Object.entries(baskets).flatMap(([id,s])=>s.basket.length&&s.basket.every(b=>Number.isFinite(quotes.get(b.id))&&quotes.get(b.id)>0)?[{id:'set:'+id,name:s.name,set:s.name,setId:id,kind:'set',market:s.basket.reduce((sum,b)=>sum+quotes.get(b.id)/b.base,0)/s.basket.length*100,unit:'points',constituents:s.basket.length}]:[]);
 await atomic(setFile,baskets);
 const prices=Object.fromEntries([...entries,...sets].filter(e=>(e.kind==='raw'||e.kind==='sealed'||e.kind==='set')&&Number.isFinite(e.market)&&e.market>0).map(e=>[e.id,e.market]));
 if(!Object.keys(prices).length)throw Error('No quotes to archive; history preserved.');
 const file=date+'.json';const snapshot={version:1,observedAt,sourceUpdated,prices};
 await atomic(path.join(dir,file),snapshot);
 manifest.days.push({date,t:observedAt,sourceUpdated,file,quotes:Object.keys(prices).length});manifest.days.sort((a,b)=>a.t.localeCompare(b.t));
 // Retain 400 daily snapshots, enough for year-over-year comparisons. Older forecast outcomes remain.
 const expired=manifest.days.splice(0,Math.max(0,manifest.days.length-400));
 for(const old of expired)await fs.unlink(path.join(dir,old.file));
 manifest.generatedAt=observedAt;manifest.scope='Physical raw and sealed provider quote variants; excludes digital entries. Graded per-item history is not connected.';
 const ledger=await read(path.join(publicDir,'forecasts.json'),{version:1,model:'Seven-day log trend v1',methodology:'Extrapolates the latest seven-day log price slope for seven more days. Requires eight daily observations. Persistence (unchanged price) is the baseline. Experimental, not investment advice.',forecasts:[],outcomes:[]});
 ledger.version=2;ledger.model='Daily log trend v2';ledger.methodology='Eight daily observations over seven days; endpoint log-trend extrapolation at 1, 2, 7, 14 and 30 days. Fixed-basket set indexes use points, not dollar set values. Daily provider releases, not intraday trades. Flat means within ±1% of baseline. Eligible outcomes only; unchanged price is the baseline. Experimental, not investment advice.';
 const outcomeIds=new Set(ledger.outcomes.map(o=>o.id));
 for(const f of ledger.forecasts){if(outcomeIds.has(f.id))continue;const result=score(f,prices[f.recordId]);const o={id:f.id,evaluatedAt:observedAt,sourceUpdated,...result};if(result&&eligibleOutcome(f,o))ledger.outcomes.push(o);}
 const previous=await Promise.all(manifest.days.slice(-8).map(d=>read(path.join(dir,d.file),null)));
 if(previous.length>=8){
  const candidates=[...entries.filter(e=>e.kind==='raw'&&e.market>=10).slice(0,20),...entries.filter(e=>e.kind==='sealed'&&e.market>0).slice(0,20),...sets.slice(0,20)];
  for(const e of candidates){const points=previous.filter(p=>p&&p.prices[e.id]>0).map(p=>({t:p.observedAt,v:p.prices[e.id]}));
   for(const horizonDays of HORIZONS){const predicted=predict(points,horizonDays);if(predicted===null)continue;
    const id=createHash('sha256').update(e.id+'|'+observedAt+'|'+horizonDays+'|log-trend-v2').digest('hex').slice(0,24);
    if(ledger.forecasts.some(f=>f.id===id))continue;
    ledger.forecasts.push({id,recordId:e.id,name:e.name,set:e.set,variant:e.variant,assetType:e.kind==='raw'?'card':e.kind,horizonDays,unit:e.unit||'usd',constituents:e.constituents,issuedAt:observedAt,sourceUpdated,dueAt:new Date(Date.parse(observedAt)+horizonDays*DAY).toISOString(),baseline:e.market,predicted});
   }
  }
 }
 ledger.generatedAt=observedAt;
 await atomic(path.join(publicDir,'forecasts.json'),ledger);
 await atomic(path.join(dir,'manifest.json'),manifest);
}
