import {describe,it,expect} from 'vitest';
import {discoveryCards} from './discoveryCards';
describe('discovery selection',()=>{
 const cards=Array.from({length:80},(_,i)=>({name:`Pokemon ${i}`,set:`Set ${i%20}`,number:String(i),market:1000-i}));
 it('reserves price leaders, mixes sets and preserves exact records',()=>{
  const picked=discoveryCards(cards);
  expect(picked).toHaveLength(18);
  expect(picked.every(c=>cards.includes(c)&&Number(c.number)>=12)).toBe(true);
  expect(new Set(picked.map(c=>c.set)).size).toBe(18);
  expect(discoveryCards([...cards].reverse())).toEqual(picked);
 });
 it('handles short feeds without duplicating Pokemon',()=>{
  expect(discoveryCards([cards[0],cards[0],cards[1]])).toHaveLength(2);
  expect(discoveryCards([])).toEqual([]);
 });
});

it('changes the selection by seed and keeps successive pages set-diverse',()=>{
 const cards=Array.from({length:500},(_,i)=>({name:`Pokemon ${i}`,set:`Set ${i%25}`,number:String(i),market:1000-i}));
 const a=discoveryCards(cards,120,'visit1'),b=discoveryCards(cards,120,'visit2');
 expect(a).not.toEqual(b);
 for(let offset=0;offset<100;offset+=18)expect(new Set(a.slice(offset,offset+18).map(c=>c.set)).size).toBeGreaterThanOrEqual(11);
 expect(new Set(a.map(c=>c.name)).size).toBe(120);
});
