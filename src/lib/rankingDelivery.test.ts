import {describe,it,expect} from 'vitest';
import {loadRankingObservations} from './rankingDelivery';
describe('ranking archive delivery',()=>{
 it('selects source dates when archives are recorded the following day',async()=>{
 const source='2026-11-18T20:05:56+0000';
 const previous='2026-11-17T20:05:43+0000';
 const days=[{date:'2026-11-19',file:'2026-11-19.json',sourceUpdated:source},{date:'2026-11-18',file:'2026-11-18.json',sourceUpdated:previous}];
 const fetcher=async(url:string)=>({ok:true,json:async()=>url.endsWith('manifest.json')?{version:1,days}: {version:1,observedAt:url.endsWith('19.json')?'2026-11-19T01:26:31Z':'2026-11-18T02:49:55Z',sourceUpdated:url.endsWith('19.json')?source:previous,prices:{'tcg:1':10}}});
 const result=await loadRankingObservations(source,fetcher as unknown as typeof fetch);
 expect(result.map(r=>r.sourceUpdated).sort()).toEqual([previous,source]);
 });
});
