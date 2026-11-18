import { describe, expect, it } from 'vitest';
import { artworkKey, rawArtworkIndex, withRawArtwork } from './rawArtwork';
import type { CatalogEntry } from '@/hooks/useCatalog';
const raw: CatalogEntry = {id:'raw:1',cardId:'base1-4',name:'Charizard',set:'Base Set',setId:'base1',number:'004/102',kind:'raw',category:null,market:200,image:'https://example.com/raw.png',sourceUrl:'',sourceUpdated:'2026-11-18'};
const graded: CatalogEntry = {...raw,id:'graded:1',kind:'graded',grade:'PSA 10',market:9000,sampleSize:12,image:'https://example.com/slab.png'};
describe('raw artwork on graded quotes',()=>{
 it('keeps grade, quote, sample size and identity while replacing only artwork',()=>{
  const result=withRawArtwork({...graded,number:'4'},rawArtworkIndex([raw]));
  expect(result).toMatchObject({id:graded.id,grade:'PSA 10',market:9000,sampleSize:12,image:raw.image});
  expect(result.imageProvenance?.match).toContain('not a photo');
 });
 it('never substitutes another set, number or a digital card',()=>{
  for(const change of [{set:'Base Set 2'},{number:'5'},{name:'Dark Charizard'}]) {
   expect(withRawArtwork({...graded,...change},rawArtworkIndex([raw])).image).toBe('');
  }
  expect(withRawArtwork(graded,rawArtworkIndex([{...raw,kind:'digital'}])).image).toBe('');
 });
 it('normalizes leading zeros but preserves numbered subsets and edition identity',()=>{
  expect(artworkKey(raw)).toBe(artworkKey({...raw,number:'4'}));
  expect(artworkKey(raw)).not.toBe(artworkKey({...raw,number:'SV4'}));
  expect(artworkKey(raw)).not.toBe(artworkKey({...raw,set:'Base Set 1st Edition'}));
 });
 it('leaves raw and sealed product images intact',()=>{
  expect(withRawArtwork(raw,new Map())).toBe(raw);
 });
});
