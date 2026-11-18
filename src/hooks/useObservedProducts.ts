import { useCatalogSealedProducts } from './useCatalogMarketCards';
import { artworkKey, rawArtworkIndex } from '@/lib/rawArtwork';
import { useMemo } from "react";
import { useMarketIndexes, useMarketMovers } from "./useMarketIndexes";
import type { CatalogEntry } from "./useCatalog";
import type { CardData, SealedProduct } from "@/data/marketData";
import {useCatalog} from './useCatalog';

/** Read existing observations; never manufacture graded/sealed values from raw cards. */
export function useObservedProducts(rawCards: CardData[] = []) {
  const catalog=useCatalog();
  const history = useMarketIndexes();
  const movers = useMarketMovers();
  const catalogSealed = useCatalogSealedProducts();
  const artIndex = useMemo(() => rawArtworkIndex(catalog.data?.entries ?? []), [catalog.data]);
  const graded = useMemo<CardData[]>(() => (history.indexes.graded?.basket ?? []).flatMap(b => {
    const m = b.q?.match(/^(.*?)\s+([A-Za-z]*\d+[A-Za-z]?(?:\x2f\d+)?)\s+(.+?)\s+(PSA|CGC|BGS|TAG)\s+(\d+(?:\.\d+)?)$/);
    if (!m || !Number.isFinite(b.median) || b.median <= 0) return [];
    const [, name, number, set, company, grade] = m;
    const identity = { name, set, number };
    const artwork = rawCards.find(c => artworkKey(c) === artworkKey(identity));
    const catalogArt = artIndex.get(artworkKey(identity));
    return [{ _catalogId:`graded:${name}:${set}:${number}:${company} ${grade}`, name, number, set, grade: `${company} ${grade}`, market:b.median,
      low:b.median, mid:b.median, change:0, _image:catalogArt?.image || artwork?._image, _sampleSize:b.n, _sourceUpdated:history.indexes.graded?.capturedAt }];
  }), [history.indexes.graded, rawCards,artIndex]);
  const sealed = useMemo<SealedProduct[]>(() => (movers.data?.topSealed ?? []).filter(p => Number.isFinite(p.market) && p.market > 0).map(p => ({
    name:p.name, type:/\bcase\b/i.test(p.name)?'Case':/elite trainer box/i.test(p.name)?'ETB':/booster box/i.test(p.name)?'Booster Box':/booster pack/i.test(p.name)?'Booster Pack':/blister/i.test(p.name)?'Blister':'Sealed', market:p.market, low:p.market, change:p.change ?? 0,
    image:p.image, sourceUpdated:movers.data?.sourceUpdated,
  })), [movers.data]);
  const gradedRecords = useMemo<CatalogEntry[]>(() => graded.map(c => ({
    id: `graded:${c.name}:${c.set}:${c.number}:${c.grade}`,
    name: c.name, set: c.set, setId: c.set, number: c.number,
    grade: c.grade, kind: "graded", category: null, market: c.market,
    image: c._image ?? "", imageProvenance: c._image ? {provider:"Raw card catalog",match:"Raw card artwork · matching name, set and number; not a photo of the graded copy"} : undefined, sourceUrl: "",
    sourceUpdated: history.indexes.graded?.capturedAt ?? null,
    sampleSize: history.indexes.graded?.basket?.find(b => b.q === `${c.name} ${c.number} ${c.set} ${c.grade}`)?.n,
  })), [graded, history.indexes.graded]);
  return { graded, gradedRecords, sealed:catalogSealed.length ? catalogSealed : sealed, gradedAt:history.indexes.graded?.capturedAt, sealedAt:movers.data?.sourceUpdated,
    isLoading:history.isLoading || movers.isLoading, isError:history.isError || movers.isError };
}
