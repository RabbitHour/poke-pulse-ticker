// Loads the forecast ledger from the same-origin build and, as a validated
// fallback, from the public durable market-data branch. The newest valid
// ledger wins; an invalid or older copy never replaces the last good one.
export const DURABLE_DATA_BASE = 'https://raw.githubusercontent.com/RabbitHour/poke-pulse-ticker/market-data/';
export const MIN_OBSERVATIONS = 8;

export interface LedgerDoc { generatedAt?: string; model?: string; methodology?: string; forecasts: any[]; outcomes: any[] }
export interface HistoryDoc { generatedAt?: string; days: { date: string; sourceUpdated: string; file: string; quotes?: number }[] }
export interface ForecastBundle { ledger: LedgerDoc; history: HistoryDoc | null; origin: 'site' | 'durable'; progress: Progress }
export interface Progress { observations: number; required: number; firstDate: string | null; lastDate: string | null; earliestIssue: string | null }

const DATE = /^\d{4}-\d{2}-\d{2}$/;
export function validLedger(d: any): d is LedgerDoc {
  return !!d && Array.isArray(d.forecasts) && Array.isArray(d.outcomes) && Number.isFinite(Date.parse(d.generatedAt))
    && d.forecasts.every((f: any) => f && typeof f.id === 'string' && Number.isFinite(Date.parse(f.issuedAt)) && Number.isFinite(Date.parse(f.dueAt)) && Date.parse(f.dueAt) > Date.parse(f.issuedAt))
    && d.outcomes.every((o: any) => o && typeof o.id === 'string' && Number.isFinite(o.actual) && Number.isFinite(Date.parse(o.evaluatedAt)));
}
export function validHistory(d: any): d is HistoryDoc {
  return !!d && Array.isArray(d.days) && d.days.every((x: any) => x && DATE.test(x.date) && /^\d{4}-\d{2}-\d{2}\.json$/.test(x.file) && typeof x.sourceUpdated === 'string');
}
// Distinct source releases only; repeated half-hour checks never count twice.
export function observationProgress(history: HistoryDoc | null): Progress {
  const releases = [...new Map((history?.days ?? []).map(d => [d.sourceUpdated, d])).values()].sort((a, b) => a.date.localeCompare(b.date));
  const first = releases[0]?.date ?? null, last = releases[releases.length - 1]?.date ?? null;
  let earliestIssue: string | null = null;
  if (first) {
    const need = Math.max(0, MIN_OBSERVATIONS - releases.length);
    const byCount = Date.parse(last + 'T00:00:00Z') + need * 86400000;
    const bySpan = Date.parse(first + 'T00:00:00Z') + 7 * 86400000;
    earliestIssue = new Date(Math.max(byCount, bySpan)).toISOString().slice(0, 10);
  }
  return { observations: releases.length, required: MIN_OBSERVATIONS, firstDate: first, lastDate: last, earliestIssue };
}
const newer = (a: { generatedAt?: string } | null, b: { generatedAt?: string } | null) => !b || (!!a && Date.parse(a.generatedAt ?? '') > Date.parse(b.generatedAt ?? ''));

async function get(fetcher: typeof fetch, url: string) {
  try { const r = await fetcher(url, { cache: 'no-cache' }); if (!r.ok) return null; if (!(r.headers.get('content-type') ?? '').match(/json|text\/plain|octet/)) return null; return await r.json(); } catch { return null; }
}

export async function loadForecastBundle(fetcher: typeof fetch = fetch, base = '/data/'): Promise<ForecastBundle> {
  const [sl, sh, dl, dh] = await Promise.all([get(fetcher, base + 'forecasts.json'), get(fetcher, base + 'history/manifest.json'), get(fetcher, DURABLE_DATA_BASE + 'forecasts.json'), get(fetcher, DURABLE_DATA_BASE + 'history/manifest.json')]);
  const site = validLedger(sl) ? sl : null, durable = validLedger(dl) ? dl : null;
  if (!site && !durable) throw Error('Forecast ledger unavailable');
  const useDurable = !!durable && newer(durable, site);
  const ledger = (useDurable ? durable : site)!;
  const histories = [validHistory(sh) ? sh : null, validHistory(dh) ? dh : null].filter(Boolean) as HistoryDoc[];
  const history = histories.sort((a, b) => b.days.length - a.days.length || Date.parse(b.generatedAt ?? '') - Date.parse(a.generatedAt ?? ''))[0] ?? null;
  return { ledger, history, origin: useDurable ? 'durable' : 'site', progress: observationProgress(history) };
}
