import type {CatalogEntry} from '@/hooks/useCatalog';
import {validObservation,type QuoteObservation} from './yesterdayMovers';
export type RankingKind='raw'|'graded'|'sealed'|'set';
export type RankingMetric='value'|'gain'|'loss'|'gainPercent'|'lossPercent'|'movement';
export interface RankingRecord {id:string;name:string;set:string;number:string;variant?:string|null;grade?:string;kind:RankingKind;value:number;image:string;href:string;sourceUpdated:string;previous:number|null;change:number|null;percent:number|null;sampleSize?:number}
export interface RankedRecord extends RankingRecord {rank:number;score:number}
const positive=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>0;
const date=(s:string)=>new Date(Date.parse(s)).toISOString().slice(0,10);
/** An hourly check is not a new source observation. Require exact dated identities. */
export function rankingRecords(entries:CatalogEntry[], observations:QuoteObservation[], sourceUpdated:string, now=Date.now()):RankingRecord[]{
 const usable=observations.filter(o=>validObservation(o)&&Date.parse(o.observedAt)<=now&&Date.parse(o.sourceUpdated)<=now);
 const current=usable.filter(o=>Date.parse(o.sourceUpdated)===Date.parse(sourceUpdated)).sort((a,b)=>Date.parse(b.observedAt)-Date.parse(a.observedAt))[0];
 const priorDay=current?new Date(Date.parse(current.sourceUpdated)-86400000).toISOString().slice(0,10):null;
 const previous=usable.filter(o=>priorDay&&date(o.sourceUpdated)===priorDay).sort((a,b)=>Date.parse(b.sourceUpdated)-Date.parse(a.sourceUpdated))[0];
 const seen=new Set<string>();const result:RankingRecord[]=[];
 for(const e of entries){
  if(e.kind==='digital'||(e.language&&e.language!=='en')||!positive(e.market)||seen.has(e.id))continue;
  if(e.kind==='graded'&&!e.grade)continue;
  seen.add(e.id);
  const sourceMatches=!!current&&Date.parse(e.sourceUpdated??'')===Date.parse(current.sourceUpdated);
  const before=sourceMatches&&current.prices[e.id]===e.market&&positive(previous?.prices[e.id])?previous!.prices[e.id]:null;
  const change=before===null?null:e.market-before;
  result.push({id:e.id,name:e.name,set:e.set,number:e.number,variant:e.variant,grade:e.grade,kind:e.kind,value:e.market,image:e.image,href:'/catalog/'+encodeURIComponent(e.id),sourceUpdated:e.sourceUpdated??'',previous:before,change,percent:before===null?null:change!/before*100,sampleSize:e.sampleSize});
 }
 if(current){
  const names=new Map(entries.filter(e=>e.kind==='raw').map(e=>[e.setId,e.set]));
  const artwork=new Map<string,string>();for(const e of entries)if(e.kind==='raw'&&e.image&&(!e.language||e.language==='en')&&!artwork.has(e.setId))artwork.set(e.setId,e.image);
  for(const [id,value] of Object.entries(current.prices)){
   if(!id.startsWith('set:')||!positive(value)||!names.has(id.slice(4)))continue;
   const before=positive(previous?.prices[id])?previous!.prices[id]:null;const change=before===null?null:value-before;
   result.push({id,name:names.get(id.slice(4))!,set:names.get(id.slice(4))!,number:'',kind:'set',value,image:artwork.get(id.slice(4))??'',href:'/sets?set='+encodeURIComponent(id.slice(4)),sourceUpdated:current.sourceUpdated,previous:before,change,percent:before===null?null:change!/before*100});
  }
 }
 return result;
}
/** Competition ranks: ties share a rank; exact ID provides stable display order. */
export function rankMarket(records:RankingRecord[],kind:RankingKind,metric:RankingMetric):RankedRecord[]{
 const scored=records.filter(r=>r.kind===kind).flatMap(r=>{
  if(metric==='value')return [{...r,score:r.value}];
  if(r.change===null||r.percent===null)return [];
  if((metric==='gain'||metric==='gainPercent')&&r.change<=0)return [];
  if((metric==='loss'||metric==='lossPercent')&&r.change>=0)return [];
  if(metric==='movement'&&r.change===0)return [];
  const score=metric==='gain'?r.change:metric==='loss'?-r.change:metric==='gainPercent'?r.percent:metric==='lossPercent'?-r.percent:Math.abs(r.change);
  return Number.isFinite(score)?[{...r,score}]:[];
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 let rank=0;return scored.map((r,i)=>{if(i===0||r.score!==scored[i-1].score)rank=i+1;return {...r,rank};});
}
