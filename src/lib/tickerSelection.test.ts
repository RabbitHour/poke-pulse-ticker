import {expect,it} from 'vitest';
import {tickerSelection,tickerOpeningIndex} from './tickerSelection';
import type {CatalogEntry} from '@/hooks/useCatalog';
const entries=['Abra','Bulbasaur','Charizard','Dragonite'].flatMap(name=>['A','B','C'].map(set=>({id:name+set,name,set,number:'1',market:10} as CatalogEntry)));
it('deduplicates names, balances sets and keeps A–Z order and original identities',()=>{
 const picked=tickerSelection(entries,'visit1');
 expect(picked.map(e=>e.name)).toEqual(['Abra','Bulbasaur','Charizard','Dragonite']);
 expect(new Set(picked.map(e=>e.set)).size).toBe(3);
 expect(picked.every(e=>entries.includes(e))).toBe(true);
 expect(tickerSelection([...entries].reverse(),'visit1')).toEqual(picked);
});
it('new opening avoids the previously displayed letter with small and empty feeds',()=>{
 const picked=tickerSelection(entries,'visit1');
 for(let n=0;n<20;n++)expect(picked[tickerOpeningIndex(picked,'A',String(n))].name[0]).not.toBe('A');
 expect(tickerOpeningIndex([],null,'x')).toBe(0);
 expect(tickerOpeningIndex([entries[0]],'A','x')).toBe(0);
});
