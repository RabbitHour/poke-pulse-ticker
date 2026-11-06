import type { CatalogEntry } from '@/hooks/useCatalog';
import { catalogSymbol } from './catalogSymbols';

/** Order the complete category before slicing; never mutate cached source records. */
export function sortTickerRecords(pool: CatalogEntry[]): CatalogEntry[] {
  return pool.map(record => ({ record, symbol: catalogSymbol(record) }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol, 'en')
      || a.record.name.localeCompare(b.record.name, 'en')
      || (a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0))
    .map(({ record }) => record);
}

export function rotatingWindow<T>(pool: T[], page: number, size: number): T[] {
  if (!pool.length) return [];
  const start = (page * size) % pool.length;
  return Array.from({ length: Math.min(size, pool.length) }, (_, i) => pool[(start + i) % pool.length]);
}
export function recordLink(e: CatalogEntry): string | undefined {
  if (e.id.startsWith('fallback:')) return e.cardId ? '/card/' + encodeURIComponent(e.cardId) + (e.variant ? '?variant=' + encodeURIComponent(e.variant) : '') : undefined;
  if (e.kind === 'graded') return undefined;
  return '/catalog/' + encodeURIComponent(e.id);
}
export function quoteAge(source: string | null): string {
  const at = source ? Date.parse(source) : NaN;
  return !Number.isFinite(at) ? 'Source date unavailable' : Date.now() - at > 36 * 3600000 ? 'STALE source release' : 'Source release';
}