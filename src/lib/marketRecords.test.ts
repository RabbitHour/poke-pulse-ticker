import { describe, it, expect } from 'vitest';
import { rotatingWindow, recordLink, sortTickerRecords } from './marketRecords';
import type { CatalogEntry } from '@/hooks/useCatalog';
describe('market record integrity', () => {
  it('sorts the full category by displayed symbol before rotating, with name and exact-ID ties', () => {
    const record = (id: string, setId: string, name: string): CatalogEntry => ({
      id, setId, name, kind: 'digital', number: '1', set: setId,
      category: null, market: null, image: '', sourceUrl: '', sourceUpdated: null,
    });
    const pool = [
      record('z', 'z', 'Aaron'), record('b-2', 'b', 'Same'),
      record('a', 'a', 'Zelda'), record('b-1', 'b', 'Same'),
      record('b-0', 'b', 'Alpha'),
    ];
    const original = [...pool];
    const sorted = sortTickerRecords(pool);
    expect(sorted.map(e => e.id)).toEqual(['a', 'b-0', 'b-1', 'b-2', 'z']);
    expect(rotatingWindow(sorted, 0, 3).map(e => e.id)).toEqual(['a', 'b-0', 'b-1']);
    expect(rotatingWindow(sorted, 1, 3).map(e => e.id)).toEqual(['b-2', 'z', 'a']);
    expect(sortTickerRecords([...pool].reverse())).toEqual(sorted);
    expect(pool).toEqual(original);
  });
  it('wraps the ticker without dropping the end of the pool or repeating within a window', () => {
    expect(rotatingWindow([1,2,3,4,5], 1, 3)).toEqual([4,5,1]);
    expect(rotatingWindow([1,2], 2, 24)).toEqual([1,2]);
  });
  it('keeps exact catalog variant identity in the link', () => {
    expect(recordLink({id:'tcg:25:Reverse Holofoil',kind:'raw',cardId:'base1-1'} as CatalogEntry)).toBe('/catalog/tcg%3A25%3AReverse%20Holofoil');
  });
});