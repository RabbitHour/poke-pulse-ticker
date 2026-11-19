import type {CatalogEntry} from '@/hooks/useCatalog';
import {discoveryHash} from './discoveryCards';
const alphabet=new Intl.Collator('en',{sensitivity:'base',numeric:true});
/** One exact printing per name per visit; balance set exposure before A–Z ordering. */
export function tickerSelection(entries:CatalogEntry[],seed:string) {
 const byName=new Map<string,CatalogEntry[]>();
 for(const entry of entries){const key=entry.name.toLowerCase();byName.set(key,[...(byName.get(key)??[]),entry]);}
 const used=new Map<string,number>();
 const selected:CatalogEntry[]=[];
 const names=[...byName.keys()].sort((a,b)=>discoveryHash(seed+a)-discoveryHash(seed+b)||alphabet.compare(a,b));
 for(const name of names){
  const entry=byName.get(name)!.sort((a,b)=>(used.get(a.set)||0)-(used.get(b.set)||0)||discoveryHash(seed+a.id)-discoveryHash(seed+b.id)||alphabet.compare(a.id,b.id))[0];
  selected.push(entry);used.set(entry.set,(used.get(entry.set)||0)+1);
 }
 return selected.sort((a,b)=>alphabet.compare(a.name,b.name)||alphabet.compare(a.id,b.id));
}
export function tickerOpeningIndex(entries:CatalogEntry[],previousLetter:string|null,seed:string) {
 const firsts=entries.map((e,i)=>({letter:e.name.charAt(0).toUpperCase(),i})).filter((e,i,a)=>!i||e.letter!==a[i-1].letter);
 const candidates=firsts.filter(e=>e.letter!==previousLetter);
 const pool=candidates.length?candidates:firsts;
 return pool.length?pool[discoveryHash(seed)%pool.length].i:0;
}
