/** Stable discovery mix: reserve price leaders for ranked sections, then vary sets and names. */
export function discoveryCards<T extends {name:string;set:string;number?:string;market:number}>(cards:T[], count=18, window=0):T[] {
  const ranked=[...cards].sort((a,b)=>b.market-a.market || a.name.localeCompare(b.name));
  const leaders=new Set(ranked.slice(0,12).map(c=>`${c.name}|${c.set}|${c.number}`));
  const pool=ranked.filter(c=>!leaders.has(`${c.name}|${c.set}|${c.number}`));
  const source=pool.length>=count ? pool : ranked;
  const hash=(s:string)=> {
    let n=2166136261;
    for (const c of s) n=Math.imul(n ^ c.charCodeAt(0),16777619);
    n=Math.imul(n ^ (n >>> 16),0x85ebca6b);
    n=Math.imul(n ^ (n >>> 13),0xc2b2ae35);
    return (n ^ (n >>> 16)) >>> 0;
  };
  const mixed=[...source].sort((a,b)=>hash(`${a.set}|${a.name}|${a.number}|${window}`)-hash(`${b.set}|${b.name}|${b.number}|${window}`));
  const selected:T[]=[], names=new Set<string>(), sets=new Set<string>(), records=new Set<string>();
  for(const distinctSets of [true,false]) for(const c of mixed) {
    const id=`${c.name}|${c.set}|${c.number}`;
    if(selected.length>=count) return selected;
    if(records.has(id)||names.has(c.name)||(distinctSets&&sets.has(c.set))) continue;
    selected.push(c); records.add(id); names.add(c.name); sets.add(c.set);
  }
  return selected;
}
