/** A reproducible shuffle for a visit; exact records and quotes are never changed. */
export const discoveryHash = (s: string) => Array.from(s).reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, 7);
export function nextDiscoverySeed() {
  try {
    const key = 'poke-discovery-visit';
    const next = (Number(sessionStorage.getItem(key)) || 0) + 1;
    sessionStorage.setItem(key, String(next));
    return `${Date.now()}-${next}`;
  } catch { return `${Date.now()}-${Math.random()}`; }
}
/** Each round visits every set before repeating one. One printing per displayed name. */
export function discoveryCards<T extends {name:string;set:string;number?:string;market:number}>(cards:T[], count=18, seed='default'):T[] {
  const ranked=[...cards].sort((a,b)=>b.market-a.market || a.name.localeCompare(b.name));
  const leaders=new Set(ranked.slice(0,12).map(c=>`${c.name}|${c.set}|${c.number}`));
  const pool=ranked.filter(c=>!leaders.has(`${c.name}|${c.set}|${c.number}`));
  const source=pool.length>=count ? pool : ranked;
  const key=(c:T)=>`${c.set}|${c.name}|${c.number}`;
  const mixed=[...source].sort((a,b)=>discoveryHash(seed+'|'+key(a))-discoveryHash(seed+'|'+key(b)) || key(a).localeCompare(key(b)));
  const buckets=new Map<string,T[]>();
  for(const card of mixed) buckets.set(card.set,[...(buckets.get(card.set)??[]),card]);
  const sets=[...buckets.keys()].sort((a,b)=>discoveryHash(seed+'|'+a)-discoveryHash(seed+'|'+b)||a.localeCompare(b));
  const result:T[]=[], names=new Set<string>();
  while(result.length<count && buckets.size) {
    for(const set of sets) {
      const bucket=buckets.get(set);
      let card:T|undefined;
      while(bucket?.length && !card){const candidate=bucket.shift()!;if(!names.has(candidate.name.toLowerCase()))card=candidate;}
      if(!bucket?.length)buckets.delete(set);
      if(card){result.push(card);names.add(card.name.toLowerCase());}
      if(result.length>=count)break;
    }
  }
  return result;
}

/** Rotate sets by UTC day, then choose a printing within that set. No first-N truncation. */
export function dailyCollectorCard<T extends {id:string;set:string}>(cards:T[], day:number, excludedSet?:string):T|undefined {
  const other=cards.filter(c=>c.set!==excludedSet);
  const pool=other.length?other:cards;
  const sets=[...new Set(pool.map(c=>c.set))].sort();
  if(!sets.length)return undefined;
  const set=sets[((day%sets.length)+sets.length)%sets.length];
  return pool.filter(c=>c.set===set).sort((a,b)=>discoveryHash(`${day}|${a.id}`)-discoveryHash(`${day}|${b.id}`)||a.id.localeCompare(b.id))[0];
}
