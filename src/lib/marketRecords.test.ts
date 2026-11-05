import { describe, it, expect } from 'vitest';
import { rotatingWindow, recordLink } from './marketRecords';
import type { CatalogEntry } from '@/hooks/useCatalog';
describe('market record integrity', () => {
  it('wraps the ticker without dropping the end of the pool or repeating within a window', () => {
    expect(rotatingWindow([1,2,3,4,5], 1, 3)).toEqual([4,5,1]);
    expect(rotatingWindow([1,2], 2, 24)).toEqual([1,2]);
  });
  it('keeps exact catalog variant identity in the link', () => {
    expect(recordLink({id:'tcg:25:Reverse Holofoil',kind:'raw',cardId:'base1-1'} as CatalogEntry)).toBe('/catalog/tcg%3A25%3AReverse%20Holofoil');
  });
});