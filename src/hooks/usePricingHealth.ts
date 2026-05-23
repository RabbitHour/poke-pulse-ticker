import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PricingHealthSource {
  name: string;
  isLive: boolean;
  latencyMs: number;
  reason?: string;
}

export interface PricingHealth {
  signalStrength: number; // 0-100
  liveCount: number;
  totalSources: number;
  sources: PricingHealthSource[];
  checkedAt: string;
}

const CACHE_KEY = "pricing_health";

export function usePricingHealth(refreshMs = 5 * 60 * 1000) {
  const [health, setHealth] = useState<PricingHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadFromCache = async () => {
      try {
        const { data } = await supabase
          .from("index_cache")
          .select("data, expires_at")
          .eq("cache_key", CACHE_KEY)
          .maybeSingle();
        if (!cancelled && data?.data) {
          setHealth(data.data as unknown as PricingHealth);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFromCache();
    const interval = setInterval(loadFromCache, refreshMs);
    return () => { cancelled = true; clearInterval(interval); };
  }, [refreshMs]);

  return { health, loading };
}
