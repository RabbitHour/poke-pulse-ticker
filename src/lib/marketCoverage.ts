import type { CatalogEntry } from '@/hooks/useCatalog';
import type { CardData } from '@/data/marketData';

// Keep every priced printing/variant; do not cap the price pool to premium cards.
export function catalogPricePool(entries: CatalogEntry[]): CardData[] {
  const seen = new Set<string>();
  return entries.flatMap(e => {
    if (e.kind !== 'raw' || e.market == null || !Number.isFinite(e.market) || e.market <= 0 || seen.has(e.id)) return [];
    seen.add(e.id);
    return [{name:e.name, set:e.set, setCode:e.setId, number:e.number,
      market:e.market, low:e.market, mid:e.market, change:0,
      _catalogId:e.id, _apiId:e.cardId, _variant:e.variant ?? undefined,
      _image:e.image, _sourceUpdated:e.sourceUpdated ?? undefined}];
  });
}

import type { QuoteObservation } from './yesterdayMovers';
export function comparableCatalogEntries(entries: CatalogEntry[], observations: QuoteObservation[], sourceUpdated: string) {
  const releases=[...observations].sort((a,b)=>a.sourceUpdated.localeCompare(b.sourceUpdated));
  const latest=releases[releases.length - 1];
  if(!latest || Date.parse(latest.sourceUpdated)!==Date.parse(sourceUpdated))return [];
  const priorDay=new Date(Date.parse(latest.sourceUpdated)-86400000).toISOString().slice(0,10);
  const priorReleases=releases.filter(r=>r.sourceUpdated.slice(0,10)===priorDay);
  const previous=priorReleases[priorReleases.length - 1];
  if(!previous)return [];
  const seen=new Set<string>();
  return entries.flatMap(entry=>{
    if(!['raw','sealed'].includes(entry.kind)||seen.has(entry.id))return [];
    const before=previous.prices[entry.id],after=latest.prices[entry.id];
    if(!(before>0)||!(after>0)||!Number.isFinite(before)||!Number.isFinite(after)||after!==entry.market)return [];
    seen.add(entry.id);
    return [{entry,change:(after/before-1)*100}];
  });
}
