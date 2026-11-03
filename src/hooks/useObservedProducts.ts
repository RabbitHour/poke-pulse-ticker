import { useMemo } from "react";
import { useMarketIndexes, useMarketMovers } from "./useMarketIndexes";
import type { CardData, SealedProduct } from "@/data/marketData";

/** Read existing observations; never manufacture graded/sealed values from raw cards. */
export function useObservedProducts(rawCards: CardData[] = []) {
  const history = useMarketIndexes();
  const movers = useMarketMovers();
  const graded = useMemo<CardData[]>(() => (history.indexes.graded?.basket ?? []).flatMap(b => {
    const m = b.q?.match(/^(.*?)\s+([A-Za-z]*\d+[A-Za-z]?(?:\x2f\d+)?)\s+(.+?)\s+(PSA|CGC|BGS|TAG)\s+(\d+(?:\.\d+)?)$/);
    if (!m || !Number.isFinite(b.median) || b.median <= 0) return [];
    const [, name, number, set, company, grade] = m;
    const artwork = rawCards.find(c => c.name.toLowerCase() === name.toLowerCase() && c.set.toLowerCase() === set.toLowerCase() && c.number === number);
    return [{ name, number, set, grade: `${company} ${grade}`, market:b.median,
      low:b.median, mid:b.median, change:0, _image:b.img || artwork?._image }];
  }), [history.indexes.graded, rawCards]);
  const sealed = useMemo<SealedProduct[]>(() => (movers.data?.topSealed ?? []).filter(p => Number.isFinite(p.market) && p.market > 0).map(p => ({
    name:p.name, type:p.set || "Sealed", market:p.market, low:p.market, change:p.change ?? 0,
    image:p.image, sourceUpdated:movers.data?.sourceUpdated,
  })), [movers.data]);
  return { graded, sealed, gradedAt:history.indexes.graded?.capturedAt, sealedAt:movers.data?.sourceUpdated,
    isLoading:history.isLoading || movers.isLoading, isError:history.isError || movers.isError };
}
