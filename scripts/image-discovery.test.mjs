import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {exactDexImage,exactSealedImage,discoverImages,imageCoverage} from './image-discovery.mjs';
const card={id:'swsh3-136',set:{id:'swsh3'},localId:'136',image:'https://assets.tcgdex.net/en/swsh/swsh3/136',variants_detailed:[{thirdParty:{tcgplayer:219333}}]};
const entry={id:'tcg:219333:Normal',kind:'raw',cardId:'swsh3-136',number:'136',language:'en',productId:219333,image:''};
const bytes=Buffer.from('524946460000000057454250','hex');
test('TCGdex requires exact card, set, number, language and cross-provider product ID',()=>{
 assert.equal(exactDexImage(entry,card),card.image+'/low.webp');
 for(const changed of [{id:'swsh3-135'},{set:{id:'swsh2'}},{localId:'135'},{image:card.image.replace('/en/','/fr/')},{variants_detailed:[{thirdParty:{tcgplayer:1}}]}])assert.equal(exactDexImage(entry,{...card,...changed}),null);
});
test('sealed photos require exact product ID and provider URL; raw and graded cannot borrow them',()=>{
 const e={kind:'sealed',productId:123},p={productId:123,imageUrl:'https://tcgplayer-cdn.tcgplayer.com/product/123_200w.jpg'};
 assert.equal(exactSealedImage(e,p),p.imageUrl);assert.equal(exactSealedImage(e,{...p,productId:124}),null);assert.equal(exactSealedImage(e,{...p,imageUrl:p.imageUrl.replace('/123_','/124_')}),null);
 for(const kind of ['raw','graded'])assert.equal(exactSealedImage({...e,kind},p),null);
});
test('request budget is bounded, successful provenance persists and failures preserve last-good image',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'image-state-'));try{
 let calls=0;const fetcher=async url=>{calls++;return String(url).includes('/cards/')?Response.json(card):new Response(bytes,{headers:{'content-type':'image/webp'}});};
 const rows=[{...entry},{...entry,id:'graded:1',kind:'graded',image:''}];const first=await discoverImages(rows,new Map(),dir,{budget:2,fetcher,now:'2026-01-01T00:00:00Z'});
 assert.equal(calls,2);assert.equal(first.discovered,1);assert.equal(rows[1].image,'');assert.equal(rows[0].imageProvenance.recordId,'swsh3-136');
 const fresh=[{...entry}];await discoverImages(fresh,new Map(),dir,{budget:2,fetcher:async()=>{throw Error('offline');},now:'2026-02-02T00:00:00Z'});
 assert.equal(fresh[0].image,card.image+'/low.webp');assert.equal(fresh[0].imageProvenance.verifiedAt,'2026-01-01T00:00:00Z');assert.equal(imageCoverage(rows).graded.missing,1);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('exact sealed photo is stored same-origin and invalid payloads cannot overwrite it',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sealed-image-'));try{
 const e={id:'tcg:123:Normal',kind:'sealed',productId:123,image:''};const products=new Map([[123,{productId:123,imageUrl:'https://tcgplayer-cdn.tcgplayer.com/product/123_200w.jpg'}]]);
 await discoverImages([e],products,dir,{budget:1,fetcher:async()=>new Response(bytes,{headers:{'content-type':'image/webp'}}),now:'2026-01-01T00:00:00Z'});
 assert.match(e.image,/^\/data\/images\/[a-f0-9]{24}\.webp$/);assert.deepEqual(await fs.readFile(path.join(dir,e.image.slice(6))),bytes);
 const old=e.image;await discoverImages([e],products,dir,{budget:1,fetcher:async()=>new Response('not a photo',{headers:{'content-type':'image/webp'}}),now:'2026-02-02T00:00:00Z'});assert.equal(e.image,old);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('a missing raw candidate becomes a card identity only after exact product-ID verification',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'candidate-image-'));try{
 const e={...entry,cardId:undefined,imageCandidateId:card.id};await discoverImages([e],new Map(),dir,{budget:2,fetcher:async url=>String(url).includes('/cards/')?Response.json(card):new Response(bytes,{headers:{'content-type':'image/webp'}})});assert.equal(e.cardId,card.id);
 const wrong={...entry,id:'wrong',cardId:undefined,imageCandidateId:card.id,productId:1};await discoverImages([wrong],new Map(),dir,{budget:2,fetcher:async()=>Response.json(card)});assert.equal(wrong.image,'');assert.equal(wrong.cardId,undefined);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});