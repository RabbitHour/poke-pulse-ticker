import { useMemo } from "react";
import type { CardData } from "@/data/marketData";
import { useEbayPrices, type EbayPriceResult } from "@/hooks/useEbayPrices";

export interface LiveBenchmark {
  label: string;
  value: number;
  change: number;
  sampleSize: number;
}

function summarize(results: EbayPriceResult[] | undefined): LiveBenchmark[] {
  return (results ?? [])
    .filter((result) => result.median > 0 && result.count > 0)
    .map((result) => ({
      label: result.query,
      value: result.median,
      change: result.changePct ?? 0,
      sampleSize: result.count,
    }));
}

export function useLiveMarketBenchmarks(cards: CardData[]) {
  const liquidCards = useMemo(
    () => cards.filter((card) => card._apiId && card.market > 0).slice(0, 8),
    [cards]
  );

  const gradedQueries = useMemo(
    () => liquidCards.map((card) => `${card.name} ${card.set} PSA 10`),
    [liquidCards]
  );
  const sealedQueries = useMemo(
    () => Array.from(new Set(liquidCards.map((card) => `${card.set} Elite Trainer Box`))).slice(0, 8),
    [liquidCards]
  );

  const graded = useEbayPrices(gradedQueries, "3000|2750", "graded");
  const sealed = useEbayPrices(sealedQueries, "1000|1500|3000", "sealed");

  return {
    graded: summarize(graded.data?.results),
    sealed: summarize(sealed.data?.results),
    isLoading: graded.isLoading || sealed.isLoading,
  };
}