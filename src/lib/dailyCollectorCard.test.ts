import {expect,it} from 'vitest';
import {dailyCollectorCard} from './discoveryCards';
it('uses sets beyond the first 24 records and avoids the hero mover set',()=>{
 const cards=Array.from({length:100},(_,i)=>({id:String(i),set:i<90?'Set A':i<95?'Set B':'Set C'}));
 const picked=Array.from({length:3},(_,day)=>dailyCollectorCard(cards,day));
 expect(new Set(picked.map(c=>c?.set)).size).toBe(3);
 for(let day=0;day<10;day++)expect(dailyCollectorCard(cards,day,'Set A')?.set).not.toBe('Set A');
 expect(dailyCollectorCard([],0)).toBeUndefined();
 expect(dailyCollectorCard(cards,5)).toEqual(dailyCollectorCard([...cards].reverse(),5));
});
