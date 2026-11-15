import type { CatalogEntry } from '@/hooks/useCatalog';
import { DURABLE_DATA_BASE, validHistory, type HistoryDoc } from './forecastDelivery';

export interface QuoteObservation { version: number; observedAt: string; sourceUpdated: string; prices: Record<string, number> }
export interface YesterdayMover { entry: CatalogEntry; previous: number; price: number; change: number; from: string; to: string }
export interface YesterdayMovers { date: string; raw: YesterdayMover | null; graded: YesterdayMover | null }
const DAY = 86400000;
const day = (at: number) => new Date(at).toISOString().slice(0, 10);

export function validObservation(value: unknown): value is QuoteObservation {
  if (!value || typeof value !== 'object') return false;
  const d = value as QuoteObservation;
  return d.version === 1 && Number.isFinite(Date.parse(d.observedAt))
    && Number.isFinite(Date.parse(d.sourceUpdated)) && Date.parse(d.observedAt) >= Date.parse(d.sourceUpdated)
    && !!d.prices && typeof d.prices === 'object' && !Array.isArray(d.prices)
    && Object.values(d.prices).every(p => typeof p === 'number' && Number.isFinite(p) && p > 0);
}

export function rankYesterdayMovers(entries: CatalogEntry[], observations: QuoteObservation[], now = Date.now()): YesterdayMover[] {
  const date = day(now - DAY), prior = day(now - 2 * DAY);
  const valid = observations.filter(o => validObservation(o) && Date.parse(o.observedAt) <= now);
  const release = (date: string) => valid.filter(o => day(Date.parse(o.sourceUpdated)) === date)
    .sort((a, b) => Date.parse(b.sourceUpdated) - Date.parse(a.sourceUpdated))[0];
  const before = release(prior), after = release(date);
  const movers: YesterdayMover[] = [];
  if (!before || !after || before.sourceUpdated === after.sourceUpdated) return movers;
  for (const entry of entries) {
    if (entry.kind !== 'raw' && entry.kind !== 'graded') continue;
    if (entry.id.startsWith('fallback:') || entry.id.startsWith('set:')) continue;
    // A raw picture is never evidence of a graded copy.
    if (entry.kind === 'graded' && (!entry.grade || !entry.image || !entry.imageProvenance || !/listing|cert/i.test(entry.imageProvenance.match))) continue;
    const previous = before.prices[entry.id], price = after.prices[entry.id];
    if (!(previous > 0) || !(price > 0) || !Number.isFinite(previous) || !Number.isFinite(price)) continue;
    const change = (price / previous - 1) * 100;
    if (!Number.isFinite(change) || change === 0) continue;
    movers.push({ entry, previous, price, change, from: before.sourceUpdated, to: after.sourceUpdated });
  }
  return movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change) || (a.entry.id < b.entry.id ? -1 : a.entry.id > b.entry.id ? 1 : 0));
}

export function selectYesterdayMovers(entries: CatalogEntry[], observations: QuoteObservation[], now = Date.now()): YesterdayMovers {
  const movers = rankYesterdayMovers(entries, observations, now);
  return {
    date: day(now - DAY),
    raw: movers.find(mover => mover.entry.kind === 'raw') ?? null,
    graded: movers.find(mover => mover.entry.kind === 'graded') ?? null,
  };
}

async function read(url: string, fetcher: typeof fetch): Promise<unknown> {
  try {
    const response = await fetcher(url, { cache: 'no-cache' });
    if (!response.ok || !/json|text\/plain|octet/.test(response.headers.get('content-type') ?? '')) return null;
    return await response.json();
  } catch { return null; }
}

export async function loadYesterdayObservations(fetcher: typeof fetch = fetch, now = Date.now()): Promise<QuoteObservation[]> {
  const dates = [day(now - DAY), day(now - 2 * DAY)];
  const bases = ['/data/', DURABLE_DATA_BASE];
  const results = await Promise.all(bases.map(async base => {
    const manifest = await read(base + 'history/manifest.json', fetcher);
    if (!validHistory(manifest)) return [];
    const days = (manifest as HistoryDoc).days.filter(d => Number.isFinite(Date.parse(d.sourceUpdated)) && dates.includes(day(Date.parse(d.sourceUpdated))));
    const snapshots = await Promise.all(days.map(async d => {
      const snapshot = await read(base + 'history/' + d.file, fetcher);
      return validObservation(snapshot) && snapshot.sourceUpdated === d.sourceUpdated ? snapshot : null;
    }));
    return snapshots.filter((s): s is QuoteObservation => s !== null);
  }));
  const observations = results.flat();
  if (!observations.length) throw Error('Comparable source observations unavailable');
  return observations;
}