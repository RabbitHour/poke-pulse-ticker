import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MarketType = "raw" | "graded" | "sealed";

export interface IndexPoint {
  t: string; // ISO timestamp of the real observation
  v: number;
}

export interface MarketIndex {
  type: MarketType;
  value: number;
  change: number | null;
  constituents: number;
  catalogItems: number | null;
  source: string;
  capturedAt: string;
  series: IndexPoint[];
}

/**
 * Real, stored index observations written by the market-index-snapshot
 * backend job. No client-side generation — the charts only plot what was
 * actually observed.
 */
export function useMarketIndexes() {
  const query = useQuery({
    queryKey: ["market-index-snapshots"],
    queryFn: async () => {
      const since = new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("market_index_snapshots")
        .select("captured_at, market_type, value, change_pct, constituents, source, meta")
        .gte("captured_at", since)
        .order("captured_at", { ascending: true })
        .limit(10000);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const indexes = useMemo(() => {
    const out: Partial<Record<MarketType, MarketIndex>> = {};
    for (const row of query.data ?? []) {
      const type = row.market_type as MarketType;
      const v = Number(row.value);
      if (!(v > 0)) continue;
      const existing = out[type];
      const series = existing?.series ?? [];
      series.push({ t: row.captured_at, v });
      const meta = (row.meta ?? {}) as Record<string, unknown>;
      out[type] = {
        type,
        value: v,
        change: row.change_pct === null || row.change_pct === undefined ? null : Number(row.change_pct),
        constituents: row.constituents ?? 0,
        catalogItems: typeof meta.catalogItems === "number" ? (meta.catalogItems as number) : null,
        source: row.source,
        capturedAt: row.captured_at,
        series,
      };
    }
    return out;
  }, [query.data]);

  return { indexes, isLoading: query.isLoading, dataUpdatedAt: query.dataUpdatedAt };
}

export interface MarketMover {
  id: number;
  name: string;
  number: string;
  set: string;
  market: number;
  prev?: number;
  change: number | null;
  image: string;
  url?: string;
}

export interface MarketMoversPayload {
  generatedAt: string;
  sourceUpdated: string;
  catalog: { singles: number; sealed: number; groups: number };
  singles: MarketMover[];
  sealed: MarketMover[];
  topSingles: MarketMover[];
}

/** Real 24h movers (TCGplayer yesterday vs today) across the full catalog. */
export function useMarketMovers() {
  return useQuery({
    queryKey: ["market-movers-24h"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("index_cache")
        .select("data, updated_at")
        .eq("cache_key", "market_movers_24h")
        .maybeSingle();
      if (error) throw error;
      return (data?.data as unknown as MarketMoversPayload) ?? null;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
}
