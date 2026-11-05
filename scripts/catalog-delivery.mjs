import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const MARKET_DATA_URL = 'https://raw.githubusercontent.com/RabbitHour/poke-pulse-ticker/market-data/catalog.json';
export const MAX_SHARD_BYTES = 1000000;
const valid = d => d && Number.isFinite(Date.parse(d.sourceUpdated)) && (Array.isArray(d.entries) && d.entries.length > 0 || Array.isArray(d.shards) && d.shards.length > 0);
const freshness = d => [Date.parse(d.sourceUpdated) || 0, Number(d.catalogRefreshedAt) || 0, Date.parse(d.generatedAt) || 0];
export function newer(a, b) { const x = freshness(a), y = freshness(b); for (let i=0;i<x.length;i++) { if(x[i]!==y[i]) return x[i]>y[i]; } return false; }

export async function writeCatalog(dataDir, catalog, maxBytes = MAX_SHARD_BYTES) {
  if (!Array.isArray(catalog.entries) || !catalog.entries.length) throw Error('Empty catalog cannot be deployed');
  const dir = path.join(dataDir, 'catalog');
  await fs.mkdir(dir, { recursive: true });
  const shards = [];
  let chunk = [], bytes = 2;
  async function flush() {
    if (!chunk.length) return;
    const body = JSON.stringify(chunk);
    const hash = createHash('sha256').update(body).digest('hex').slice(0,24);
    const filename = hash + '.json';
    await fs.writeFile(path.join(dir, filename), body);
    shards.push({ url: '/data/catalog/' + filename, count: chunk.length, bytes: Buffer.byteLength(body) });
    chunk = []; bytes = 2;
  }
  for (const entry of catalog.entries) {
    const size = Buffer.byteLength(JSON.stringify(entry));
    if (size + 2 > maxBytes) throw Error('Catalog record exceeds shard limit');
    if (bytes + size + (chunk.length ? 1 : 0) > maxBytes) await flush();
    bytes += size + (chunk.length ? 1 : 0); chunk.push(entry);
  }
  await flush();
  const { entries, ...metadata } = catalog;
  const manifest = { ...metadata, delivery: 'sharded-v1', recordCount: entries.length, shards };
  const tmp = path.join(dataDir, 'catalog.json.tmp');
  await fs.writeFile(tmp, JSON.stringify(manifest));
  await fs.rename(tmp, path.join(dataDir, 'catalog.json'));
  const keep = new Set(shards.map(s => path.basename(s.url)));
  for (const name of await fs.readdir(dir)) if (!keep.has(name)) await fs.rm(path.join(dir, name));
  return manifest;
}

export async function prepareCatalog(dataDir, fetcher = fetch) {
  await fs.mkdir(dataDir, {recursive:true});
  let local;
  try { local = JSON.parse(await fs.readFile(path.join(dataDir,'catalog.json'),'utf8')); } catch {}
  if (local?.shards) {
    // A partial checkout must never silently ship a manifest with missing shards.
    try { let count=0; for (const s of local.shards) {if(!/^\/data\/catalog\/[a-f0-9]+\.json$/.test(s.url))throw Error('Invalid shard path');const rows=JSON.parse(await fs.readFile(path.join(dataDir,'catalog',path.basename(s.url)),'utf8'));if(!Array.isArray(rows)||rows.length!==s.count)throw Error('Incomplete bundled shard');count+=rows.length;}if(count!==local.recordCount)throw Error('Incomplete bundled catalog'); } catch { local = undefined; }
  }
  let candidate;
  try {
    const response = await fetcher(MARKET_DATA_URL + '?build=' + Date.now(), {signal:AbortSignal.timeout(30000), cache:'no-store'});
    if (!response.ok) throw Error('HTTP ' + response.status);
    candidate = await response.json();
    if (!valid(candidate)) throw Error('Invalid durable catalog');
    if (candidate.shards) {
      const entries=[];
      for (const shard of candidate.shards) {
        if (!/^\/data\/catalog\/[a-f0-9]+\.json$/.test(shard.url)) throw Error('Invalid shard path');
        const r=await fetcher(new URL('catalog/'+path.basename(shard.url), MARKET_DATA_URL).href,{signal:AbortSignal.timeout(30000)});
        if(!r.ok) throw Error('Durable shard unavailable');
        const rows=await r.json();
        if(!Array.isArray(rows)||rows.length!==shard.count) throw Error('Incomplete durable shard');
        entries.push(...rows);
      }
      if(entries.length!==candidate.recordCount) throw Error('Incomplete durable catalog');
      candidate={...candidate,entries};
    }
    // Exact sealed photos are same-origin files and must travel with the manifest.
    // Stage all required files before replacing the validated bundled catalog.
    const imagePaths=[...new Set(candidate.entries.map(e=>e.image).filter(u=>typeof u==='string'&&u.startsWith('/data/images/')))];
    const images=[];
    for(const url of imagePaths){
      if(!/^\/data\/images\/[a-f0-9]{24}\.(jpg|png|webp)$/.test(url))throw Error('Invalid stored image path');
      const relative=url.slice('/data/'.length),dest=path.join(dataDir,relative);
      try{await fs.access(dest);continue;}catch{}
      const r=await fetcher(new URL(relative,MARKET_DATA_URL).href,{signal:AbortSignal.timeout(30000)});
      if(!r.ok)throw Error('Stored product photo unavailable');
      const body=Buffer.from(await r.arrayBuffer());if(!body.length||body.length>2_000_000)throw Error('Invalid stored image size');
      if(createHash('sha256').update(body).digest('hex').slice(0,24)!==path.basename(url).split('.')[0])throw Error('Stored photo hash mismatch');
      images.push({dest,body});
    }
    for(const {dest,body} of images){await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,body);}
  } catch (error) {
    candidate = undefined;
    if (!valid(local)) throw Error('No deployable catalog: ' + error.message);
    console.warn('Durable catalog unavailable; retaining bundled source release ' + local.sourceUpdated);
  }
  const selected = valid(candidate) && (!valid(local) || newer(candidate,local)) ? candidate : local;
  if (!valid(selected)) throw Error('No deployable catalog');
  const manifest = selected.entries ? await writeCatalog(dataDir,selected) : selected;
  // Both build hosts ship the same durable ledger, not an older checked-in copy.
  // A failed companion fetch retains the last good local ledger and history.
  try {
    const companion=async file=>{const r=await fetcher(new URL(file,MARKET_DATA_URL).href,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Ledger unavailable');return r.json();};
    const [ledger,history,sealed]=await Promise.all(['forecasts.json','history/manifest.json','sealed-indexes.json'].map(companion));
    if(!Array.isArray(ledger.forecasts)||!Array.isArray(ledger.outcomes)||!Array.isArray(history.days)||!sealed.categories)throw Error('Invalid durable ledger');
    const snapshots=[];
    for(const day of history.days){if(!/^\d{4}-\d{2}-\d{2}\.json$/.test(day.file))throw Error('Invalid snapshot path');const snapshot=await companion('history/'+day.file);if(!snapshot.prices||snapshot.sourceUpdated!==day.sourceUpdated)throw Error('Invalid snapshot');snapshots.push([day.file,snapshot]);}
    await fs.mkdir(path.join(dataDir,'history'),{recursive:true});
    for(const [file,snapshot] of snapshots)await fs.writeFile(path.join(dataDir,'history',file),JSON.stringify(snapshot));
    for(const [file,value] of [['forecasts.json',ledger],['history/manifest.json',history],['sealed-indexes.json',sealed]]){await fs.writeFile(path.join(dataDir,file+'.tmp'),JSON.stringify(value));await fs.rename(path.join(dataDir,file+'.tmp'),path.join(dataDir,file));}
  }catch {console.warn('Durable companion ledger unavailable; retaining bundled history.');}
  console.log(`Deployable catalog: ${manifest.recordCount} records; source ${manifest.sourceUpdated}`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareCatalog(path.resolve('public/data'));
}