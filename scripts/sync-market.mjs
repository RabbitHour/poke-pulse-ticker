// Public-source catalog builder. No credentials, scraping, or customer data.
// Run with Node 24: npm run market:sync. Keep npm run market:watch open for 30-minute checks.
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {recordHistory} from './record-history.mjs';
import {writeCatalog} from './catalog-delivery.mjs';
import {classifyProduct,PRODUCT_CATEGORIES} from '../src/lib/productCategories.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cacheDir=path.join(root,'work','market-cache');const publicDir=path.join(root,'public','data');
await fs.mkdir(cacheDir,{recursive:true});await fs.mkdir(publicDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function json(url){for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'PokePulseCatalog/2.0'}});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}catch(e){if(attempt===2)throw e;await sleep(1200*(attempt+1));}}}
async function read(file,fallback){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return fallback;}}
async function write(file,data){const tmp=file+'.tmp';await fs.writeFile(tmp,JSON.stringify(data));await fs.rename(tmp,file);}
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,'and').replace(/^(?:sve|sv|swsh|sm|xy|me)\d*\s*[:—-]\s*/,'').replace(/[^a-z0-9]/g,'');
const num=s=>String(s??'').split('/')[0].toUpperCase().replace(/^([A-Z]*)0+(\d)/,'$1$2');
async function run(){
 const lock=path.join(cacheDir,'sync.lock');let handle;try{handle=await fs.open(lock,'wx');}catch{throw Error('Another catalog sync is running, or work/market-cache/sync.lock remains after a crash. Verify no updater is running before removing that lock.');}
 try{
  const start=new Date().toISOString();
  const dateText=await fetch('https://tcgcsv.com/last-updated.txt',{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'PokePulseCatalog/2.0 (+https://poke-pulse-ticker.lovable.app/)'}}).then(r=>{if(!r.ok)throw Error('Provider timestamp unavailable');return r.text();});
  const sourceUpdated=dateText.trim();if(!sourceUpdated)throw Error('Provider timestamp empty; preserving existing catalog.');
  let dex=await read(path.join(cacheDir,'dex.json'),null);
  if(!dex||Date.now()-dex.at>86400000){const [cards,sets]=await Promise.all([json('https://api.tcgdex.net/v2/en/cards'),json('https://api.tcgdex.net/v2/en/sets')]);dex={at:Date.now(),cards,sets};await write(path.join(cacheDir,'dex.json'),dex);}
  const pocketSetIds=new Set(dex.sets.filter(s=>/^(?:[AB][0-9]+[a-z]?|P-A)$/.test(s.id)||String(s.logo||s.symbol||" ").includes("/tcgp/")).map(s=>s.id));
  const digitalCards=dex.cards.filter(c=>pocketSetIds.has(c.id.slice(0,c.id.lastIndexOf('-'))));
  const englishCards=dex.cards.filter(c=>!pocketSetIds.has(c.id.slice(0,c.id.lastIndexOf("-"))));
  const setNames=new Map(dex.sets.map(s=>[s.id,s.name]));const artMap=new Map();
  for(const c of englishCards){const setId=c.id.slice(0,c.id.lastIndexOf('-'));const key=norm(setNames.get(setId))+'|'+num(c.localId||c.id.split('-').at(-1))+'|'+norm(c.name);artMap.set(key,c);}
  let groupCache=await read(path.join(cacheDir,'groups.json'),null);
  if(!groupCache||groupCache.sourceUpdated!==sourceUpdated){groupCache={sourceUpdated,results:(await json('https://tcgcsv.com/tcgplayer/3/groups')).results};await write(path.join(cacheDir,'groups.json'),groupCache);}
  const groups=groupCache.results;if(!Array.isArray(groups)||!groups.length)throw Error('No groups returned');
  const results=[];const failures=[];let cursor=0;
  async function worker(){while(cursor<groups.length){const g=groups[cursor++];let cache=await read(path.join(cacheDir,g.groupId+'.json'),null);
   try{if(cache?.sourceUpdated!==sourceUpdated){const [products,prices]=await Promise.all([json('https://tcgcsv.com/tcgplayer/3/'+g.groupId+'/products'),json('https://tcgcsv.com/tcgplayer/3/'+g.groupId+'/prices')]);if(!Array.isArray(products.results)||!Array.isArray(prices.results))throw Error('Invalid group payload');cache={sourceUpdated,products:products.results,prices:prices.results};await write(path.join(cacheDir,g.groupId+'.json'),cache);await sleep(250);}results.push({g,cache});}
   catch(e){failures.push({id:g.groupId,name:g.name,error:String(e.message)});}
   if((results.length+failures.length)%25===0)console.log('Catalog groups checked: '+(results.length+failures.length)+'/'+groups.length);
  }}
  await Promise.all([worker(),worker(),worker()]);
  if(failures.length){await write(path.join(cacheDir,'last-failures.json'),failures);throw Error(failures.length+' groups failed. Previous published catalog preserved. Cached successes will be reused on retry.');}
  const entries=[];const matchedDex=new Set();
  for(const {g,cache} of results){const prices=new Map();for(const p of cache.prices){if(!prices.has(p.productId))prices.set(p.productId,[]);prices.get(p.productId).push(p);}
   for(const p of cache.products){const ext=p.extendedData??[];const number=ext.find(e=>e.name==='Number')?.value??'';const description=ext.find(e=>e.name==='CardText')?.value??'';
    const kind=number?'raw':'sealed';if(!number&&/code card|sleeves|playmat|deck box|portfolio|\bcoin\b|\bdice\b|jumbo|oversized/i.test(p.name))continue;
    const art=number?artMap.get(norm(g.name)+'|'+num(number)+'|'+norm(p.name)):null;if(art)matchedDex.add(art.id);
    const variants=prices.get(p.productId)??[];const available=variants.length?variants:[{}];
    for(const quote of available){const market=Number.isFinite(quote.marketPrice)&&quote.marketPrice>0?quote.marketPrice:null;
     entries.push({id:'tcg:'+p.productId+':'+(quote.subTypeName||'unknown'),productId:p.productId,cardId:art?.id,name:p.name,set:g.name,setId:g.abbreviation||String(g.groupId),number,kind,
      category:kind==='sealed'?classifyProduct(p.name,description):null,market,variant:quote.subTypeName||null,image:art?.image?art.image+'/low.webp':'',
      sourceUrl:'https://www.tcgplayer.com/product/'+encodeURIComponent(p.productId),sourceUpdated});
    }
   }
  }
  for(const c of englishCards){if(matchedDex.has(c.id))continue;const setId=c.id.slice(0,c.id.lastIndexOf('-'));entries.push({id:'dex:'+c.id,cardId:c.id,name:c.name,set:setNames.get(setId)||setId,setId,number:c.localId||c.id.split('-').at(-1),kind:'raw',category:null,market:null,variant:null,image:c.image?c.image+'/low.webp':'',sourceUrl:'https://api.tcgdex.net/v2/en/cards/'+encodeURIComponent(c.id),sourceUpdated:null});}
  for(const c of digitalCards){const setId=c.id.slice(0,c.id.lastIndexOf('-'));entries.push({id:'pocket:'+c.id,cardId:c.id,name:c.name,set:setNames.get(setId)||setId,setId,number:c.localId||c.id.split('-').at(-1),kind:'digital',category:null,market:null,variant:null,image:c.image?c.image+'/low.webp':'',sourceUrl:'https://api.tcgdex.net/v2/en/cards/'+encodeURIComponent(c.id),sourceUpdated:null});}
  entries.sort((a,b)=>Number(Boolean(b.image))-Number(Boolean(a.image)) || Number(b.market!==null)-Number(a.market!==null) || (b.market??0)-(a.market??0) || a.id.localeCompare(b.id));
  const catalog={version:4,digitalCatalogCount:digitalCards.length,catalogRefreshedAt:dex.at,generatedAt:start,sourceUpdated,languageScope:'English physical and Pocket digital TCGdex catalogs plus TCGplayer-listed physical products; not guaranteed worldwide coverage',englishCatalogCount:englishCards.length,excludedDigitalEntries:0,providerGroups:groups.length,
   pricedRecords:entries.filter(e=>e.market!==null).length,entries};
  const histFile=path.join(cacheDir,'category-history.json');const history=await read(histFile,await read(path.join(publicDir,'sealed-indexes.json'),{version:1,categories:{}}));
  const historyBefore=JSON.stringify(history);
  for(const category of PRODUCT_CATEGORIES){const current=entries.filter(e=>e.category===category.id&&e.market>0);let h=history.categories[category.id];
   if(!h&&current.length){h={title:category.title,baseAt:start,basket:current.map(e=>({id:e.id,base:e.market})),series:[]};history.categories[category.id]=h;}
   if(!h)continue;const quotes=new Map(current.map(e=>[e.id,e.market]));const covered=h.basket.filter(b=>quotes.has(b.id));h.available=current.length;h.matched=covered.length;h.constituents=h.basket.length;h.sourceUpdated=sourceUpdated;
   // No replacement constituents, synthetic history, or last-price carry-forward.
   if(covered.length===h.basket.length&&h.series.at(-1)?.sourceUpdated!==sourceUpdated){
    const value=h.basket.reduce((sum,b)=>sum+quotes.get(b.id)/b.base,0)/h.basket.length*100;
    h.series.push({t:start,sourceUpdated,v:Math.round(value*10000)/10000});h.series=h.series.slice(-3000);
   }
  }
  history.sourceUpdated=sourceUpdated;history.methodology='Equal-weight fixed launch basket, rebased to 100; points added only when every constituent has a current quote.';
  if(JSON.stringify(history)!==historyBefore)history.generatedAt=start;
  await write(histFile,history);await recordHistory(publicDir,entries,sourceUpdated,start);const previousCatalog=await read(path.join(publicDir,'catalog.json'),null);const publishCatalog=previousCatalog?.version!==catalog.version||previousCatalog?.sourceUpdated!==sourceUpdated||previousCatalog?.catalogRefreshedAt!==dex.at;if(publishCatalog)await writeCatalog(publicDir,catalog);await write(path.join(publicDir,'sealed-indexes.json'),history);
  // Vite preview serves dist; keep its data current when a build already exists.
  try{await fs.access(path.join(root,'dist','index.html'));const d=path.join(root,'dist','data');await fs.mkdir(d,{recursive:true});if(publishCatalog)await writeCatalog(d,catalog);await write(path.join(d,'sealed-indexes.json'),history);}catch{}
  console.log(JSON.stringify({englishCards:englishCards.length,records:entries.length,priced:catalog.pricedRecords,groups:groups.length,categories:Object.fromEntries(PRODUCT_CATEGORIES.map(c=>[c.id,history.categories[c.id]?.available??0]))},null,2));
 }finally{await handle?.close();await fs.unlink(lock).catch(()=>{});}
}
do{try{await run();}catch(e){console.error(e.message);if(!process.argv.includes('--watch'))process.exitCode=1;}if(!process.argv.includes('--watch'))break;console.log('Next provider check in 30 minutes. Ctrl+C stops the updater.');await sleep(1800000);}while(true);
