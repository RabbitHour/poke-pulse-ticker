// 2026-11-18 — A clean clone can contain a manifest without its generated shards.
// Repair it before starting Vite, using the same durable release as production.
import fs from 'node:fs/promises';
import path from 'node:path';
import { prepareCatalog } from './catalog-delivery.mjs';
const dir=path.resolve('public/data');
let complete=false;
try {
 const manifest=JSON.parse(await fs.readFile(path.join(dir,'catalog.json'),'utf8'));
 if(Array.isArray(manifest.entries)&&manifest.entries.length) complete=true;
 else if(manifest.delivery==='sharded-v1' && manifest.shards?.length) {
  let count=0;
  for(const shard of manifest.shards){
   if(!/^\/data\/catalog\/[a-f0-9]+\.json$/.test(shard.url))throw Error('Invalid shard');
   const rows=JSON.parse(await fs.readFile(path.join(dir,'catalog',path.basename(shard.url)),'utf8'));
   if(!Array.isArray(rows)||rows.length!==shard.count)throw Error('Incomplete shard');
   count+=rows.length;
  }
  complete=count===manifest.recordCount;
 }
} catch { /* Hydrate below. */ }
if(!complete) await prepareCatalog(dir);
else console.log('Local catalog is complete.');
