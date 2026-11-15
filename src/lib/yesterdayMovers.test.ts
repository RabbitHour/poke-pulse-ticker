import { describe, expect, it } from 'vitest';
import type { CatalogEntry } from '@/hooks/useCatalog';
import { selectYesterdayMovers, validObservation, loadYesterdayObservations, type QuoteObservation } from './yesterdayMovers';
const now = Date.parse('2026-11-06T13:32:00Z');
const entry = (id: string, kind: 'raw' | 'graded' = 'raw'): CatalogEntry => ({ id, kind, name: id, set: 'Test', setId: 'test', number: '1', category: null, market: 999, image: '/photo.jpg', sourceUrl: '', sourceUpdated: null });
const observation = (date: string, prices: Record<string, number>): QuoteObservation => ({ version: 1, observedAt: date + 'T21:00:00Z', sourceUpdated: date + 'T20:00:00Z', prices });
describe('yesterday exact-variant movers', () => {
  it('compares Nov 4 to Nov 5 releases and ranks absolute movement, never current catalog prices', () => {
    const result = selectYesterdayMovers([entry('tcg:1:Holo'), entry('tcg:2:Normal')], [observation('2026-11-04', { 'tcg:1:Holo': 100, 'tcg:2:Normal': 100 }), observation('2026-11-05', { 'tcg:1:Holo': 110, 'tcg:2:Normal': 80 }), observation('2026-11-06', { 'tcg:1:Holo': 900 })], now);
    expect(result.date).toBe('2026-11-05');
    expect(result.raw?.entry.id).toBe('tcg:2:Normal');
    expect(result.raw?.change).toBeCloseTo(-20);
    expect(result.raw?.price).toBe(80);
    expect(result.graded).toBeNull();
  });
  it('never substitutes a different variant, an index, repeated release, or a missing prior day', () => {
    const entries = [entry('tcg:1:Holo'), entry('set:test')];
    expect(selectYesterdayMovers(entries, [observation('2026-11-04', { 'tcg:1:Normal': 10, 'set:test': 100 }), observation('2026-11-05', { 'tcg:1:Holo': 20, 'set:test': 150 })], now).raw).toBeNull();
    const only = observation('2026-11-05', { 'tcg:1:Holo': 20 });
    expect(selectYesterdayMovers(entries, [only, only], now).raw).toBeNull();
  });
  it('requires an exact graded listing or certificate image, not raw artwork or aggregate baskets', () => {
    const graded = { ...entry('cert:123:PSA10', 'graded'), grade: 'PSA 10' };
    const observations = [observation('2026-11-04', { [graded.id]: 100 }), observation('2026-11-05', { [graded.id]: 125 })];
    expect(selectYesterdayMovers([graded], observations, now).graded).toBeNull();
    const verified = { ...graded, imageProvenance: { provider: 'Existing provider', recordId: '123', match: 'Exact certificate image' } };
    expect(selectYesterdayMovers([verified], observations, now).graded?.change).toBe(25);
  });
  it('rejects invalid and future observations', () => {
    expect(validObservation(observation('2026-11-05', { a: 0 }))).toBe(false);
    const future = { ...observation('2026-11-05', { a: 20 }), observedAt: '2026-11-07T00:00:00Z' };
    expect(selectYesterdayMovers([entry('a')], [observation('2026-11-04', { a: 10 }), future], now).raw).toBeNull();
  });
  it('loads matching durable snapshots when the site archive is missing and rejects release mismatch', async () => {
    const fetcher = (async (url: string) => {
      if (url.startsWith('/')) return new Response('', { status: 404 });
      const d = url.endsWith('manifest.json') ? { days: ['2026-11-04', '2026-11-05'].map(date => ({ date, file: date + '.json', sourceUpdated: date + 'T20:00:00Z' })) }
        : observation(url.includes('2026-11-04') ? '2026-11-04' : '2026-11-03', { a: 10 });
      return new Response(JSON.stringify(d), { headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    expect(await loadYesterdayObservations(fetcher, now)).toHaveLength(1);
  });
});