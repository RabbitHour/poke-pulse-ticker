import { expect, it } from 'vitest';
import { catalogPricePool, comparableCatalogEntries } from './marketCoverage';
import type { CatalogEntry } from '@/hooks/useCatalog';
const entry:CatalogEntry={id:'tcg:1:Holo',kind:'raw',name:'Pikachu',set:'Test',setId:'test',number:'1',market:2,category:null,image:'',sourceUrl:'',sourceUpdated:'2026-11-17T20:00:00Z'};
const observations=[{version:1,observedAt:'2026-11-16T21:00:00Z',sourceUpdated:'2026-11-16T20:00:00Z',prices:{[entry.id]:1}},{version:1,observedAt:'2026-11-17T21:00:00Z',sourceUpdated:entry.sourceUpdated!,prices:{[entry.id]:2}}];
it('uses all valid raw prices including inexpensive cards and preserves exact variants',()=>{
 const pool=catalogPricePool([entry,{...entry,id:'tcg:1:Reverse',market:0.05},entry,{...entry,id:'digital',kind:'digital'},{...entry,id:'missing',market:null}]);
 expect(pool.map(c=>c._catalogId)).toEqual(['tcg:1:Holo','tcg:1:Reverse']);
 expect(pool[1].market).toBe(0.05);
});
it('counts only exact consecutive comparable quotes without copying a different variant history',()=>{
 const result=comparableCatalogEntries([entry,entry,{...entry,id:'tcg:1:Reverse'}],observations,entry.sourceUpdated!);
 expect(result).toHaveLength(1);expect(result[0].change).toBe(100);
 expect(comparableCatalogEntries([entry],observations,'2026-11-18T20:00:00Z')).toEqual([]);
 expect(comparableCatalogEntries([entry],observations.slice(1),entry.sourceUpdated!)).toEqual([]);
 expect(comparableCatalogEntries([{...entry,market:3}],observations,entry.sourceUpdated!)).toEqual([]);
});
