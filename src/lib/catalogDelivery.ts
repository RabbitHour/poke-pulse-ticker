import {DURABLE_DATA_BASE} from './forecastDelivery';
/** Prefer the newest complete release; a bad remote release never discards a valid bundle. */
export async function loadCatalog(fetcher: typeof fetch = fetch) {
  async function json(url: string) {
    const response = await fetcher(url, {cache:'no-cache',signal:AbortSignal.timeout(20000)});
    if (!response.ok || !/json|text\/plain|octet/.test(response.headers.get('content-type')??'')) throw Error('Catalog files are unavailable');
    return response.json();
  }
  const bases=['/data/',DURABLE_DATA_BASE];
  const manifests=await Promise.all(bases.map(async base=>{
    try {const manifest=await json(base+'catalog.json');return manifest&&typeof manifest==='object'&&!Array.isArray(manifest)?{base,manifest}:null;}catch{return null;}
  }));
  const candidates=manifests.filter((v):v is NonNullable<typeof v>=>v!==null).sort((a,b)=>
    (Date.parse(b.manifest.sourceUpdated)||0)-(Date.parse(a.manifest.sourceUpdated)||0) || (Number(b.manifest.version)||0)-(Number(a.manifest.version)||0));
  let lastError:unknown=Error('Catalog files are unavailable');
  for(const {base,manifest} of candidates)try {
    if (Array.isArray(manifest.entries)) {
      if(!manifest.entries.length)throw Error('Incomplete catalog');
      return manifest;
    }
    if (manifest.delivery !== 'sharded-v1' || !Array.isArray(manifest.shards) || !manifest.shards.length) throw Error('Invalid catalog manifest');
    const chunks: unknown[][] = new Array(manifest.shards.length);
    let cursor = 0;
    async function worker() {
      while (cursor < manifest.shards.length) {
        const index = cursor++;
        const shard = manifest.shards[index];
        if (!/^\/data\/catalog\/[a-f0-9]+\.json$/.test(shard.url)) throw Error('Invalid catalog shard path');
        const rows = await json(base+shard.url.slice('/data/'.length));
        if (!Array.isArray(rows) || rows.length !== shard.count) throw Error('Incomplete catalog shard');
        chunks[index] = rows;
      }
    }
    await Promise.all(Array.from({length: Math.min(4, manifest.shards.length)}, worker));
    const entries = chunks.flat();
    if (entries.length !== manifest.recordCount) throw Error('Incomplete catalog');
    return {...manifest, entries};
  } catch(error){lastError=error;}
  throw lastError;
}
