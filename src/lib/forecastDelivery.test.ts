import { describe, it, expect } from 'vitest';
import { loadForecastBundle, observationProgress, DURABLE_DATA_BASE } from './forecastDelivery';
import { resolvedMetrics } from './forecastRules.mjs';

const json = (d: unknown) => new Response(JSON.stringify(d), { headers: { 'content-type': 'application/json' } });
const html = () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } });
const fx = (routes: Record<string, () => Response>) => (async (u: string) => (routes[u] ?? (() => new Response('', { status: 404 })))()) as unknown as typeof fetch;
const day = (date: string) => ({ date, sourceUpdated: date + 'T20:06:00+0000', file: date + '.json' });
const ledger = (generatedAt: string, forecasts: any[] = [], outcomes: any[] = []) => ({ generatedAt, forecasts, outcomes });

describe('forecast delivery', () => {
  it('uses newer durable ledger when the deployed build is stale', async () => {
    const b = await loadForecastBundle(fx({
      '/data/forecasts.json': () => json(ledger('2026-11-03T00:00:00Z')),
      '/data/history/manifest.json': () => json({ days: [day('2026-11-03')] }),
      [DURABLE_DATA_BASE + 'forecasts.json']: () => json(ledger('2026-11-05T06:00:00Z')),
      [DURABLE_DATA_BASE + 'history/manifest.json']: () => json({ days: ['2026-11-03', '2026-11-04', '2026-11-05'].map(day) }),
    }));
    expect(b.origin).toBe('durable');
    expect(b.progress.observations).toBe(3);
    expect(b.progress.earliestIssue).toBe('2026-11-10');
  });
  it('keeps last good site ledger when durable copy is invalid, older, or HTML', async () => {
    for (const bad of [() => json({ forecasts: 'x' }), () => json(ledger('2026-11-01T00:00:00Z')), html]) {
      const b = await loadForecastBundle(fx({ '/data/forecasts.json': () => json(ledger('2026-11-04T00:00:00Z')), [DURABLE_DATA_BASE + 'forecasts.json']: bad }));
      expect(b.origin).toBe('site');
    }
  });
  it('fails rather than substituting when no valid ledger exists', async () => {
    await expect(loadForecastBundle(fx({}))).rejects.toThrow();
  });
  it('counts distinct source releases, not repeated checks', () => {
    expect(observationProgress({ days: [day('2026-11-03'), { ...day('2026-11-04'), sourceUpdated: day('2026-11-03').sourceUpdated }] }).observations).toBe(1);
  });
  it('chronological maturation: no accuracy until a real on-time outcome exists', () => {
    const f = { id: 'a', recordId: 'r', issuedAt: '2026-11-10T00:00:00Z', dueAt: '2026-11-11T00:00:00Z', baseline: 10, predicted: 11, horizonDays: 1, sourceUpdated: '2026-11-09T20:00:00Z' };
    expect(resolvedMetrics([f], []).accuracy).toBeNull();
    expect(resolvedMetrics([f], [{ id: 'a', actual: 12, evaluatedAt: '2026-11-10T12:00:00Z', sourceUpdated: '2026-11-10T00:00:00Z' }]).count).toBe(0);
  });
});
