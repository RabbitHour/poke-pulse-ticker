import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const hosts = ['https://www.pokepulseticker.com','https://pokepulseticker.com','https://poke-pulse-ticker.lovable.app','https://poke-pulse-ticker.com'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  if (!response.ok) throw Error('HTTP ' + response.status);
  if (!hosts.includes(new URL(response.url).origin)) throw Error('Redirect outside expected hosts');
  return response;
}
const localHtml = await readFile('dist/index.html', 'utf8');
const assets = [...new Set([...localHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map(m => m[1]))];
if (!assets.length) throw Error('No local build assets found; run the production build first.');
let failed = false;
for (const host of hosts) {
  try {
    const page = await get(host + '/');
    const html = await page.text();
    if (!html.includes('id="root"')) throw Error('Missing application root');
    for (const asset of assets) {
      if (!html.includes(asset)) throw Error('HTML does not reference local build asset: ' + asset);
      const remote = Buffer.from(await (await get(host + asset)).arrayBuffer());
      const local = await readFile(path.join('dist', asset.slice(1)));
      if (hash(remote) !== hash(local)) throw Error('Asset bytes differ: ' + asset);
    }
    const account = await get(host + '/account');
    if (!(await account.text()).includes('id="root"')) throw Error('/account does not serve application shell');
    const catalog = await (await get(host + '/data/catalog.json')).json();
    let catalogRecords = catalog.entries?.length;
    if (catalog.delivery === 'sharded-v1' && Array.isArray(catalog.shards) && catalog.shards.length) {
      catalogRecords = 0;
      for (const shard of catalog.shards) {
        if (!/^\/data\/catalog\/[a-f0-9]+\.json$/.test(shard.url)) throw Error('Invalid catalog shard URL');
        const rows = await (await get(host + shard.url)).json();
        if (!Array.isArray(rows) || rows.length !== shard.count) throw Error('Incomplete catalog shard: ' + shard.url);
        catalogRecords += rows.length;
      }
      if (catalogRecords !== catalog.recordCount) throw Error('Catalog record count differs from manifest');
    }
    if (!catalogRecords) throw Error('Missing catalog records');
    const released = Date.parse(catalog.sourceUpdated);
    if (!Number.isFinite(released)) throw Error('Missing/invalid catalog source date');
    const ageHours = (Date.now() - released) / 3600000;
    if (ageHours < -1 || ageHours > 72) throw Error('Catalog source timestamp is outside the -1 to 72 hour window');
    console.log(JSON.stringify({host, finalUrl: page.url, result:'matching-entry-assets-and-shell', catalogRecords, sourceUpdated:catalog.sourceUpdated}));
  } catch (error) {
    failed = true;
    console.error(JSON.stringify({host, result:'FAIL', reason:error.message}));
  }
}
console.log('These are HTTP, entry-asset, route-shell and catalog checks only. Verify lazy modules, charts, images, Ask Poke, authentication email and Stripe sandbox in a browser separately.');
if (failed) process.exitCode = 1;
