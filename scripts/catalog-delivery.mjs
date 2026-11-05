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
  } catch (error) {
    candidate = undefined;
    if (!valid(local)) throw Error('No deployable catalog: ' + error.message);
    console.warn('Durable catalog unavailable; retaining bundled source release ' + local.sourceUpdated);
  }
  const selected = valid(candidate) && (!valid(local) || newer(candidate,local)) ? candidate : local;
  if (!valid(selected)) throw Error('No deployable catalog');
  const manifest = selected.entries ? await writeCatalog(dataDir,selected) : selected;
  console.log(`Deployable catalog: ${manifest.recordCount} records; source ${manifest.sourceUpdated}`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareCatalog(path.resolve('public/data'));
}