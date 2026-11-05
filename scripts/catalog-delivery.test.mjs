import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {writeCatalog,prepareCatalog} from './catalog-delivery.mjs';
const catalog={version:4,sourceUpdated:'2026-11-04T20:06:16+0000',generatedAt:'2026-11-05T15:27:30.734Z',entries:Array.from({length:9},(_,i)=>({id:`tcg:${i}:Holofoil`,name:'Pikachu',market:10+i,image:'https://assets.tcgdex.net/en/swsh/swsh4/025/low.webp'}))};
test('same-origin shards preserve every exact variant, quote, image and source timestamp within asset limits',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'catalog-shards-'));
  try{const m=await writeCatalog(dir,catalog,350);assert.ok(m.shards.length>1);assert.equal(m.sourceUpdated,'2026-11-04T20:06:16+0000');let rows=[];for(const s of m.shards){assert.ok(s.bytes<=350);assert.match(s.url,/^\/data\/catalog\/[a-f0-9]+\.json$/);rows.push(...JSON.parse(await fs.readFile(path.join(dir,'catalog',path.basename(s.url)))));}assert.deepEqual(rows,catalog.entries);assert.equal(m.recordCount,9);}finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('build restores latest durable release, does not replace a newer local release, and retains bundled catalog offline',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'catalog-build-'));
 try{await writeCatalog(dir,{...catalog,sourceUpdated:'2026-11-03T20:00:00Z'});const m=await prepareCatalog(dir,async()=>new Response(JSON.stringify(catalog)));assert.equal(m.sourceUpdated,catalog.sourceUpdated);const newer={...catalog,sourceUpdated:'2026-11-05T20:00:00Z'};await writeCatalog(dir,newer);assert.equal((await prepareCatalog(dir,async()=>new Response(JSON.stringify(catalog)))).sourceUpdated,newer.sourceUpdated);assert.equal((await prepareCatalog(dir,async()=>{throw Error('offline')})).sourceUpdated,newer.sourceUpdated);}finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('build fails instead of deploying a missing catalog or partial bundled shards',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'catalog-missing-'));
 try{await assert.rejects(prepareCatalog(dir,async()=>{throw Error('offline')}),/No deployable catalog/);const m=await writeCatalog(dir,catalog);await fs.rm(path.join(dir,'catalog',path.basename(m.shards[0].url)));await assert.rejects(prepareCatalog(dir,async()=>{throw Error('offline')}),/No deployable catalog/);}finally{await fs.rm(dir,{recursive:true,force:true});}
});