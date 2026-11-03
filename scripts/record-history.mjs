import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const DAY=86400000;
const read=async(p,f)=>{try{return JSON.parse(await fs.readFile(p,'utf8'));}catch(e){if(e.code==='ENOENT')return f;throw e;}};
async function atomic(p,d){await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p+'.tmp',JSON.stringify(d));await fs.rename(p+'.tmp',p);}
// Point-in-time forecast. Requires eight distinct daily observations spanning seven days.
export function predict(points){
 if(points.length<8)return null;
 const recent=points.slice(-8),a=recent[0],b=recent.at(-1),days=(Date.parse(b.t)-Date.parse(a.t))/DAY;
 if(days<7||recent.some(p=>!Number.isFinite(p.v)||p.v<=0))return null;
 const value=b.v*Math.exp(Math.log(b.v/a.v)/days*7);
 return Number.isFinite(value)&&value>0?Math.round(value*100)/100:null;
}
export function score(f,actual){if(!Number.isFinite(actual)||actual<=0)return null;return {actual,absolutePercentError:Math.abs(f.predicted-actual)/actual*100,baselineAbsolutePercentError:Math.abs(f.baseline-actual)/actual*100};}
export async function recordHistory(publicDir,entries,sourceUpdated,observedAt){
 const dir=path.join(publicDir,'history');await fs.mkdir(dir,{recursive:true});
 const manifest=await read(path.join(dir,'manifest.json'),{version:1,days:[]});
 // Save at most one observation for a provider release. A repeat check is not a fresh price.
 if(manifest.days.some(d=>d.sourceUpdated===sourceUpdated))return;
 const date=observedAt.slice(0,10);if(manifest.days.some(d=>d.date===date))return;
 const prices=Object.fromEntries(entries.filter(e=>(e.kind==='raw'||e.kind==='sealed')&&Number.isFinite(e.market)&&e.market>0).map(e=>[e.id,e.market]));
 if(!Object.keys(prices).length)throw Error('No quotes to archive; history preserved.');
 const file=date+'.json';const snapshot={version:1,observedAt,sourceUpdated,prices};
 await atomic(path.join(dir,file),snapshot);
 manifest.days.push({date,t:observedAt,sourceUpdated,file,quotes:Object.keys(prices).length});manifest.days.sort((a,b)=>a.t.localeCompare(b.t));
 // Retain 400 daily snapshots, enough for year-over-year comparisons. Older forecast outcomes remain.
 const expired=manifest.days.splice(0,Math.max(0,manifest.days.length-400));
 for(const old of expired)await fs.unlink(path.join(dir,old.file));
 manifest.generatedAt=observedAt;manifest.scope='Physical raw and sealed provider quote variants; excludes digital entries. Graded per-item history is not connected.';
 const ledger=await read(path.join(publicDir,'forecasts.json'),{version:1,model:'Seven-day log trend v1',methodology:'Extrapolates the latest seven-day log price slope for seven more days. Requires eight daily observations. Persistence (unchanged price) is the baseline. Experimental, not investment advice.',forecasts:[],outcomes:[]});
 const outcomeIds=new Set(ledger.outcomes.map(o=>o.id));
 for(const f of ledger.forecasts){if(!outcomeIds.has(f.id)&&Date.parse(f.dueAt)<=Date.parse(observedAt)&&Date.parse(observedAt)-Date.parse(f.dueAt)<=2*DAY&&Date.parse(sourceUpdated)>Date.parse(f.sourceUpdated)){
   const result=score(f,prices[f.recordId]);if(result)ledger.outcomes.push({id:f.id,evaluatedAt:observedAt,sourceUpdated,...result});
 }}
 const previous=await Promise.all(manifest.days.slice(-8).map(d=>read(path.join(dir,d.file),null)));
 if(previous.length>=8){
  const candidates=entries.filter(e=>e.kind==='raw'&&e.image&&e.market>=10).slice(0,20);
  for(const e of candidates){const points=previous.filter(p=>p&&p.prices[e.id]>0).map(p=>({t:p.observedAt,v:p.prices[e.id]}));const predicted=predict(points);if(predicted===null)continue;
   const id=createHash('sha256').update(e.id+'|'+observedAt+'|log-trend-v1').digest('hex').slice(0,24);
   ledger.forecasts.push({id,recordId:e.id,name:e.name,set:e.set,variant:e.variant,issuedAt:observedAt,sourceUpdated,dueAt:new Date(Date.parse(observedAt)+7*DAY).toISOString(),baseline:e.market,predicted});
  }
 }
 ledger.generatedAt=observedAt;
 await atomic(path.join(publicDir,'forecasts.json'),ledger);
 await atomic(path.join(dir,'manifest.json'),manifest);
}
