import {describe,it,expect,vi} from 'vitest';
import {loadCatalog} from './catalogDelivery';
describe('catalog host-independent delivery',()=>{
 it('loads every shard from same-origin URLs and keeps source quotes and exact variants',async()=>{
  const entries=[{id:'tcg:123:Holofoil',market:42.5,image:'https://images.pokemontcg.io/sv3/1.png'},{id:'tcg:123:Normal',market:3.25}];
  const m={delivery:'sharded-v1',sourceUpdated:'2026-11-04T20:06:16+0000',recordCount:2,shards:[{url:'/data/catalog/abc.json',count:1},{url:'/data/catalog/def.json',count:1}]};
  const fetcher=vi.fn(async(url:RequestInfo|URL)=>new Response(JSON.stringify(url==='/data/catalog.json'?m:[entries[url==='/data/catalog/abc.json'?0:1]]),{headers:{'content-type':'application/json'}}));
  const result=await loadCatalog(fetcher as typeof fetch);expect(result.entries).toEqual(entries);expect(result.sourceUpdated).toBe(m.sourceUpdated);expect(fetcher.mock.calls.map(c=>c[0])).toEqual(['/data/catalog.json','/data/catalog/abc.json','/data/catalog/def.json']);
 });
 it('rejects SPA HTML instead of pretending it is an empty catalog',async()=>{
  await expect(loadCatalog((async()=>new Response('<html></html>',{headers:{'content-type':'text/html'}})) as typeof fetch)).rejects.toThrow('unavailable');
 });
 it('rejects missing shards and off-origin shard paths',async()=>{
  for(const url of ['/data/catalog/abc.json','https://other.example/abc.json']){
   const fetcher=async(p:RequestInfo|URL)=>new Response(JSON.stringify(p==='/data/catalog.json'?{delivery:'sharded-v1',recordCount:1,shards:[{url,count:1}]}:[]),{headers:{'content-type':'application/json'}});
   await expect(loadCatalog(fetcher as typeof fetch)).rejects.toThrow();
  }
 });
});