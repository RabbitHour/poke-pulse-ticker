// Only existing provider endpoints; discovery never substitutes artwork across identities.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const IMAGE_BUDGET = 80;
const MAX_BYTES = 2_000_000;
export function exactDexImage(entry, card) {
  const setId = entry.cardId?.slice(0, entry.cardId.lastIndexOf('-'));
  if (!setId || card?.id !== entry.cardId || card.set?.id !== setId || String(card.localId) !== String(entry.number).split('/')[0]) return null;
  const language = entry.language || 'en';
  if (entry.productId && !card.variants_detailed?.some(v => Number(v.thirdParty?.tcgplayer) === entry.productId)) return null;
  try { const u = new URL(card.image); if (u.origin !== 'https://assets.tcgdex.net' || !u.pathname.startsWith('/'+language+'/')) return null; return u.href+'/low.webp'; } catch { return null; }
}
export function exactSealedImage(entry, product) {
  if (entry.kind !== 'sealed' || !entry.productId || product?.productId !== entry.productId) return null;
  try { const u = new URL(product.imageUrl); return u.origin === 'https://tcgplayer-cdn.tcgplayer.com' && new RegExp('^/product/'+entry.productId+'(?:_|\\.)').test(u.pathname) ? u.href : null; } catch { return null; }
}
export function imageCoverage(entries) {
  return Object.fromEntries(['raw','sealed','graded','digital'].map(kind => {
    const rows = entries.filter(e => e.kind === kind), available = rows.filter(e => e.image).length;
    return [kind, {total:rows.length,available,verified:rows.filter(e=>e.image && e.imageProvenance?.verifiedAt).length,missing:rows.length-available}];
  }));
}
export async function discoverImages(entries, products, dataDir, {fetcher=fetch, budget=IMAGE_BUDGET, now=new Date().toISOString()}={}) {
  const stateFile = path.join(dataDir,'image-discovery.json');
  let state; try { state=JSON.parse(await fs.readFile(stateFile,'utf8')); } catch(e) { if(e.code!=='ENOENT')throw e; state={version:1,records:{}}; }
  const records=state.records;
  for (const e of entries) {
    const old=records[e.id];
    if(old?.image) { e.image=old.image; e.imageProvenance=old.provenance; }
    else if(e.image) {e.imageProvenance=e.imageProvenance||{provider:'TCGdex',recordId:e.cardId,language:e.language||'en',match:'catalog artwork; exact detail not yet checked'};records[e.id]={...old,image:e.image,provenance:e.imageProvenance};}
  }
  const unique=new Map();
  for(const e of entries) {
    // No supported exact listing/certificate provider is connected for graded images.
    if(e.kind!=='raw' && e.kind!=='sealed' && e.kind!=='digital')continue;
    if(e.kind!=='sealed' && !e.cardId)continue;
    const key=e.kind==='sealed'?'tcg:'+e.productId:'dex:'+(e.language||'en')+':'+e.cardId+':'+(e.productId||'metadata');
    if(!unique.has(key))unique.set(key,[]);unique.get(key).push(e);
  }
  const pending=[...unique.values()].filter(rows => {
    const last=records[rows[0].id];return !last?.checkedAt || Date.parse(now)-Date.parse(last.checkedAt)>=(last.image?30:1)*86400000;
  }).sort((a,b)=>Number(Boolean(a[0].image))-Number(Boolean(b[0].image)) || (Date.parse(records[a[0].id]?.checkedAt)||0)-(Date.parse(records[b[0].id]?.checkedAt)||0) || a[0].id.localeCompare(b[0].id));
  // Round-robin the priority queues so a large sealed backlog cannot starve raw art.
  const queues=['raw','sealed','digital'].map(kind=>pending.filter(rows=>rows[0].kind===kind));
  const candidates=[];for(let i=0;i<Math.max(...queues.map(q=>q.length));i++)for(const queue of queues)if(queue[i])candidates.push(queue[i]);
  // Bound all network requests, including artwork validation, to this run's budget.
  let requests=0, discovered=0;
  async function request(url){if(requests>=budget)throw Error('Budget exhausted');requests++;const r=await fetcher(url,{signal:AbortSignal.timeout(15000),redirect:'error',headers:{'User-Agent':'PokePulseCatalog/2.0 (+https://poke-pulse-ticker.lovable.app/)'}});if(!r.ok)throw Error('Provider HTTP '+r.status);return r;}
  for(const rows of candidates){const e=rows[0];if(requests+(e.kind==='sealed'?1:2)>budget)break;
    let image,provenance,error;
    try {
      const endpoint=e.kind==='sealed'?'https://tcgcsv.com/tcgplayer/3/'+e.groupId+'/products':'https://api.tcgdex.net/v2/'+(e.language||'en')+'/cards/'+encodeURIComponent(e.cardId);
      const url=e.kind==='sealed'?exactSealedImage(e,products.get(e.productId)):exactDexImage(e,await (await request(endpoint)).json());
      if(!url)throw Error('No exact provider image');
      const r=await request(url),type=(r.headers.get('content-type')||'').split(';')[0];
      if(!['image/jpeg','image/png','image/webp'].includes(type)||Number(r.headers.get('content-length'))>MAX_BYTES)throw Error('Invalid image payload');
      const reader=r.body.getReader();let size=0;const chunks=[];
      for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES){await reader.cancel();throw Error('Image too large');}chunks.push(value);}
      const body=Buffer.concat(chunks);
      const magic=type==='image/jpeg'?body[0]===255&&body[1]===216:type==='image/png'?body.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):body.toString('ascii',0,4)==='RIFF'&&body.toString('ascii',8,12)==='WEBP';
      if(!magic)throw Error('Invalid image bytes');
      if(e.kind==='sealed') {const ext=type==='image/jpeg'?'jpg':type==='image/png'?'png':'webp';const name=createHash('sha256').update(body).digest('hex').slice(0,24)+'.'+ext;await fs.mkdir(path.join(dataDir,'images'),{recursive:true});await fs.writeFile(path.join(dataDir,'images',name),body);image='/data/images/'+name;}
      else image=url;
      provenance={provider:e.kind==='sealed'?'TCGCSV':'TCGdex',recordId:e.kind==='sealed'?String(e.productId):e.cardId,language:e.kind==='sealed'?undefined:e.language||'en',sourceUrl:endpoint,originalUrl:url,verifiedAt:now,match:e.kind==='sealed'?'exact product ID':'exact card/set/language'+(e.productId?' and provider product ID':'')};discovered+=rows.length;
    } catch(err) {error=err.message;}
    for(const row of rows) {const old=records[row.id];records[row.id]={...old,checkedAt:now,error:error||null,...(image?{image,provenance}:{})};if(image){row.image=image;row.imageProvenance=provenance;}}
  }
  // The durable branch, not an expiring Actions cache, preserves successful discoveries.
  const tmp=stateFile+'.tmp';await fs.writeFile(tmp,JSON.stringify({...state,lastCheckedAt:now,lastRequests:requests,records}));await fs.rename(tmp,stateFile);
  return {checkedAt:now,requests,budget,discovered,coverage:imageCoverage(entries)};
}