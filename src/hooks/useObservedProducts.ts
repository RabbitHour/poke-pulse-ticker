import { useMemo } from "react";
import { useMarketIndexes, useMarketMovers } from "./useMarketIndexes";
import type { CardData, SealedProduct } from "@/data/marketData";
import {useCatalog} from './useCatalog';

/** Read existing observations; never manufacture graded/sealed values from raw cards. */
export function useObservedProducts(rawCards: CardData[] = []) {
  const catalog=useCatalog();
  const history = useMarketIndexes();
  const movers = useMarketMovers();
  const graded = useMemo<CardData[]>(() => (history.indexes.graded?.basket ?? []).flatMap(b => {
    const m = b.q?.match(/^(.*?)\s+([A-Za-z]*\d+[A-Za-z]?(?:\x2f\d+)?)\s+(.+?)\s+(PSA|CGC|BGS|TAG)\s+(\d+(?:\.\d+)?)$/);
    if (!m || !Number.isFinite(b.median) || b.median <= 0) return [];
    const [, name, number, set, company, grade] = m;
    const artwork = rawCards.find(c => c.name.toLowerCase() === name.toLowerCase() && c.set.toLowerCase() === set.toLowerCase() && c.number === number);
    const normalize=(s:string)=>s.toLowerCase().replace(/^(?:sv|swsh|sm|xy)\d*\s*[:—-]\s*/,'').replace(/[^a-z0-9]/g,'');
    const catalogArt=catalog.data?.entries.find(c=>c.kind==='raw'&&c.image&&normalize(c.name)===normalize(name)&&normalize(c.set)===normalize(set)&&c.number.split('/')[0].replace(/^0+/,'')===number.split('/')[0].replace(/^0+/,''));
    return [{ name, number, set, grade: `${company} ${grade}`, market:b.median,
      low:b.median, mid:b.median, change:0, _image:b.img || artwork?._image || catalogArt?.image }];
  }), [history.indexes.graded, rawCards,catalog.data]);
  const sealed = useMemo<SealedProduct[]>(() => (movers.data?.topSealed ?? []).filter(p => Number.isFinite(p.market) && p.market > 0).map(p => ({
    name:p.name, type:/\bcase\b/i.test(p.name)?'Case':/elite trainer box/i.test(p.name)?'ETB':/booster box/i.test(p.name)?'Booster Box':/booster pack/i.test(p.name)?'Booster Pack':/blister/i.test(p.name)?'Blister':'Sealed', market:p.market, low:p.market, change:p.change ?? 0,
    image:p.image, sourceUpdated:movers.data?.sourceUpdated,
  })), [movers.data]);
  return { graded, sealed, gradedAt:history.indexes.graded?.capturedAt, sealedAt:movers.data?.sourceUpdated,
    isLoading:history.isLoading || movers.isLoading, isError:history.isError || movers.isError };
}
