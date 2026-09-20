import { useMemo } from "react";
import type { CardData } from "@/data/marketData";
import { useEbayPrices, type EbayPriceResult } from "@/hooks/useEbayPrices";

export interface LiveBenchmark {
  label: string;
  value: number;
  change: number;
  sampleSize: number;
  image?: string;
  apiId?: string;
  set?: string;
}

function summarize(
  results: EbayPriceResult[] | undefined,
  sourceCards: CardData[] = []
): LiveBenchmark[] {
  return (results ?? [])
    .filter((result) => result.median > 0 && result.count > 0)
    .map((result) => {
      const normalized = result.query.toLowerCase();
      const source = sourceCards.find((card) =>
        normalized.startsWith(`${card.name} ${card.set}`.toLowerCase())
      );
      return {
        label: result.query,
        value: result.median,
        change: result.changePct ?? 0,
        sampleSize: result.count,
        image: source?._image,
        apiId: source?._apiId,
        set: source?.set,
      };
    });
}

export function useLiveMarketBenchmarks(cards: CardData[]) {
  const liquidCards = useMemo(
    () => cards.filter((card) => card._apiId && card.market > 0).slice(0, 30),
    [cards]
  );

  const rawQueries = useMemo(
    () => liquidCards.map((card) => `${card.name} ${card.set}`),
    [liquidCards]
  );

  const gradedQueries = useMemo(
    () => liquidCards.map((card) => `${card.name} ${card.set} PSA 10`),
    [liquidCards]
  );
  const sealedQueries = useMemo(
    () => Array.from(new Set(liquidCards.flatMap((card) => [
      `${card.set} Booster Box`,
      `${card.set} Elite Trainer Box`,
    ]))).slice(0, 30),
    [liquidCards]
  );

  const raw = useEbayPrices(rawQueries, "1000|3000|2750", "raw");
  const graded = useEbayPrices(gradedQueries, "3000|2750", "graded");
  const sealed = useEbayPrices(sealedQueries, "1000|1500|3000", "sealed");

  return {
    raw: summarize(raw.data?.results, liquidCards),
    graded: summarize(graded.data?.results, liquidCards),
    sealed: summarize(sealed.data?.results),
    isLoading: raw.isLoading || graded.isLoading || sealed.isLoading,
  };
}