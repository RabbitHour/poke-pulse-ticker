export async function loadCatalog(fetcher: typeof fetch = fetch) {
  async function json(url: string) {
    const response = await fetcher(url, { cache: 'no-cache' });
    if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw Error('Catalog files are unavailable');
    return response.json();
  }
  const manifest = await json('/data/catalog.json');
  if (Array.isArray(manifest.entries)) return manifest;
  if (manifest.delivery !== 'sharded-v1' || !Array.isArray(manifest.shards) || !manifest.shards.length) throw Error('Invalid catalog manifest');
  const chunks: unknown[][] = new Array(manifest.shards.length);
  let cursor = 0;
  async function worker() {
    while (cursor < manifest.shards.length) {
      const index = cursor++;
      const shard = manifest.shards[index];
      if (!/^\/data\/catalog\/[a-f0-9]+\.json$/.test(shard.url)) throw Error('Invalid catalog shard path');
      const rows = await json(shard.url);
      if (!Array.isArray(rows) || rows.length !== shard.count) throw Error('Incomplete catalog shard');
      chunks[index] = rows;
    }
  }
  await Promise.all(Array.from({length: Math.min(4, manifest.shards.length)}, worker));
  const entries = chunks.flat();
  if (entries.length !== manifest.recordCount) throw Error('Incomplete catalog');
  return {...manifest, entries};
}