// Market index snapshot collector.
//
// Free, keyless, source-backed pricing for EVERY Poké product TCGplayer lists:
//   - RAW + SEALED: TCGcsv (https://tcgcsv.com) — a free mirror of TCGplayer's
//     own daily product/price feeds (category 3 = Pokémon). Swept a slice of
//     sets per run so the full catalog refreshes every few hours without
//     hammering the source (no bans).
//   - GRADED: eBay Browse API medians (via our ebay-pricing function) for a
//     fixed basket of iconic PSA 10 slabs, refreshed every 30 min.
//
// Every index value written here is computed from real observed prices.
// Nothing is simulated, interpolated, or multiplied.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TCGCSV = "https://tcgcsv.com/tcgplayer/3";
const UA = { "User-Agent": "PokePulseTicker/1.0 (+https://poke-pulse-ticker.com)" };
const GROUPS_PER_RUN = 24;
const INDEX_SIZE = 1000;
const GRADED_EVERY_MS = 30 * 60 * 1000;

// Fixed graded basket — constant constituents keep the index comparable over time.
const GRADED_BASKET = [
  "Umbreon VMAX 215 Evolving Skies PSA 10",
  "Charizard ex 199 Obsidian Flames PSA 10",
  "Charizard ex 223 Paldean Fates PSA 10",
  "Pikachu ex 238 Surging Sparks PSA 10",
  "Umbreon ex 161 Prismatic Evolutions PSA 10",
  "Mew ex 232 Paldean Fates PSA 10",
  "Rayquaza VMAX 218 Evolving Skies PSA 10",
  "Giratina V 186 Lost Origin PSA 10",
  "Lugia V 186 Silver Tempest PSA 10",
  "Gengar VMAX 271 Fusion Strike PSA 10",
  "Espeon VMAX 270 Fusion Strike PSA 10",
  "Charizard 4 Base Set Unlimited PSA 10",
  "Charizard ex 183 151 PSA 10",
  "Moonbreon PSA 10",
  "Mewtwo ex 205 151 PSA 10",
  "Sylveon ex 156 Prismatic Evolutions PSA 10",
];

type Item = { id: number; n: string; num?: string; p: number; pv: number | null };

interface Group { groupId: number; name: string; abbreviation?: string }

async function getJson<T>(url: string, timeoutMs = 15000): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: UA });
    if (!res.ok) { await res.body?.cancel(); return null; }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const EXCLUDE_SEALED = /(code card|card sleeves|\bsleeves\b|playmat|deck box|portfolio|\bpins?\b|coin\b|dice|jumbo|oversized)/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sweepGroup(
  g: Group,
  sourceUpdated: string,
  existing: { singles: Item[]; sealed: Item[]; source_updated: string | null } | undefined,
) {
  const [prod, pr] = await Promise.all([
    getJson<{ results: any[] }>(`${TCGCSV}/${g.groupId}/products`),
    getJson<{ results: any[] }>(`${TCGCSV}/${g.groupId}/prices`),
  ]);
  if (!prod?.results || !pr?.results) return null;

  // Highest market variant per product (matches getBestPrice policy).
  const best = new Map<number, number>();
  for (const p of pr.results) {
    const m = typeof p.marketPrice === "number" && p.marketPrice > 0 ? p.marketPrice : 0;
    if (!m) continue;
    if (m > (best.get(p.productId) ?? 0)) best.set(p.productId, m);
  }

  const newDay = !existing || existing.source_updated !== sourceUpdated;
  const prevMap = new Map<number, Item>();
  for (const it of [...(existing?.singles ?? []), ...(existing?.sealed ?? [])]) prevMap.set(it.id, it);
  const prevFor = (id: number): number | null => {
    const old = prevMap.get(id);
    if (!old) return null;
    // A new TCGplayer daily file arrived: yesterday's price becomes the baseline.
    return newDay ? old.p : old.pv;
  };

  const singles: Item[] = [];
  const sealed: Item[] = [];
  for (const p of prod.results) {
    const price = best.get(p.productId);
    if (!price) continue;
    const ext: { name: string; value: string }[] = p.extendedData ?? [];
    const number = ext.find((e) => e.name === "Number")?.value;
    const name = String(p.name ?? "").trim();
    if (!name) continue;
    if (number) {
      singles.push({ id: p.productId, n: name, num: number, p: price, pv: prevFor(p.productId) });
    } else if (!EXCLUDE_SEALED.test(name)) {
      sealed.push({ id: p.productId, n: name, p: price, pv: prevFor(p.productId) });
    }
  }
  singles.sort((a, b) => b.p - a.p);
  sealed.sort((a, b) => b.p - a.p);

  return {
    group_id: g.groupId,
    name: g.name,
    singles: singles.slice(0, 150),
    sealed: sealed.slice(0, 150),
    singles_count: singles.length,
    sealed_count: sealed.length,
    source_updated: sourceUpdated,
    refreshed_at: new Date().toISOString(),
  };
}

function basketStats(items: (Item & { g: string })[]) {
  const top = items.slice().sort((a, b) => b.p - a.p).slice(0, INDEX_SIZE);
  if (!top.length) return null;
  const value = top.reduce((s, i) => s + i.p, 0) / top.length;
  // Same-constituent day change: only items that have yesterday's price.
  const withPrev = top.filter((i) => typeof i.pv === "number" && i.pv! > 0);
  const now = withPrev.reduce((s, i) => s + i.p, 0);
  const then = withPrev.reduce((s, i) => s + (i.pv as number), 0);
  const change = withPrev.length >= Math.min(50, top.length) && then > 0 ? ((now - then) / then) * 100 : null;
  return { value, change, constituents: top.length, withPrev: withPrev.length };
}

function movers(items: (Item & { g: string })[], minPrice: number, limit: number) {
  return items
    .filter((i) => i.p >= minPrice && typeof i.pv === "number" && i.pv! > 0 && i.p !== i.pv)
    .map((i) => ({
      id: i.id,
      name: i.n,
      number: i.num ?? "",
      set: i.g,
      market: Math.round(i.p * 100) / 100,
      prev: Math.round((i.pv as number) * 100) / 100,
      change: Math.round(((i.p - (i.pv as number)) / (i.pv as number)) * 10000) / 100,
      image: `https://tcgplayer-cdn.tcgplayer.com/product/${i.id}_400w.jpg`,
      url: `https://www.tcgplayer.com/product/${i.id}`,
    }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!authToken || authToken !== serviceKey) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);
  const report: Record<string, unknown> = {};

  try {
    // ---------- 1. Sweep a slice of the TCGplayer catalog ----------
    const [groupsRes, lastUpdatedRaw] = await Promise.all([
      getJson<{ results: Group[] }>(`${TCGCSV}/groups`),
      fetch("https://tcgcsv.com/last-updated.txt", { headers: UA, signal: AbortSignal.timeout(8000) })
        .then((r) => (r.ok ? r.text() : ""))
        .catch(() => ""),
    ]);
    const sourceUpdated = lastUpdatedRaw.trim() || new Date().toISOString().slice(0, 10);
    const groups = groupsRes?.results ?? [];

    const { data: rows } = await supabase
      .from("market_catalog_groups")
      .select("group_id, source_updated, refreshed_at");
    const meta = new Map((rows ?? []).map((r: any) => [r.group_id, r]));

    // Never-seen groups first, then stale (older TCGplayer file), then oldest refresh.
    const queue = groups
      .map((g) => ({ g, m: meta.get(g.groupId) }))
      .sort((a, b) => {
        const rank = (x: any) => (!x.m ? 0 : x.m.source_updated !== sourceUpdated ? 1 : 2);
        const d = rank(a) - rank(b);
        if (d) return d;
        return String(a.m?.refreshed_at ?? "").localeCompare(String(b.m?.refreshed_at ?? ""));
      })
      .filter((x) => !x.m || x.m.source_updated !== sourceUpdated)
      .slice(0, GROUPS_PER_RUN)
      .map((x) => x.g);

    let swept = 0;
    for (let i = 0; i < queue.length; i += 6) {
      const batch = queue.slice(i, i + 6);
      const ids = batch.map((g) => g.groupId);
      const { data: existingRows } = await supabase
        .from("market_catalog_groups")
        .select("group_id, singles, sealed, source_updated")
        .in("group_id", ids);
      const ex = new Map((existingRows ?? []).map((r: any) => [r.group_id, r]));
      const results = await Promise.all(batch.map((g) => sweepGroup(g, sourceUpdated, ex.get(g.groupId))));
      const good = results.filter(Boolean);
      if (good.length) {
        const { error } = await supabase.from("market_catalog_groups").upsert(good as any[], { onConflict: "group_id" });
        if (error) console.error("upsert groups", error.message);
        else swept += good.length;
      }
    }
    report.swept = swept;
    report.sourceUpdated = sourceUpdated;

    // ---------- 2. Compute RAW + SEALED indexes from the stored catalog ----------
    const { data: all } = await supabase
      .from("market_catalog_groups")
      .select("name, singles, sealed, singles_count, sealed_count, source_updated");
    const catalog = all ?? [];
    const singles: (Item & { g: string })[] = [];
    const sealed: (Item & { g: string })[] = [];
    let singlesTotal = 0;
    let sealedTotal = 0;
    for (const r of catalog as any[]) {
      singlesTotal += r.singles_count ?? 0;
      sealedTotal += r.sealed_count ?? 0;
      for (const it of r.singles ?? []) singles.push({ ...it, g: r.name });
      for (const it of r.sealed ?? []) sealed.push({ ...it, g: r.name });
    }
    const coverage = groups.length ? catalog.length / groups.length : 0;
    report.coverage = coverage;

    const snapshots: any[] = [];
    if (coverage >= 0.9) {
      const raw = basketStats(singles);
      const sea = basketStats(sealed);
      const common = {
        groups: catalog.length,
        groupsTotal: groups.length,
        sourceUpdated,
      };
      if (raw) {
        snapshots.push({
          market_type: "raw",
          value: Math.round(raw.value * 100) / 100,
          change_pct: raw.change === null ? null : Math.round(raw.change * 100) / 100,
          constituents: raw.constituents,
          source: "tcgplayer (tcgcsv)",
          meta: { ...common, catalogItems: singlesTotal, withPrev: raw.withPrev },
        });
      }
      if (sea) {
        snapshots.push({
          market_type: "sealed",
          value: Math.round(sea.value * 100) / 100,
          change_pct: sea.change === null ? null : Math.round(sea.change * 100) / 100,
          constituents: sea.constituents,
          source: "tcgplayer (tcgcsv)",
          meta: { ...common, catalogItems: sealedTotal, withPrev: sea.withPrev },
        });
      }

      // 24h movers with real prev/now TCGplayer prices + product images.
      await supabase.from("index_cache").upsert(
        {
          cache_key: "market_movers_24h",
          data: {
            generatedAt: new Date().toISOString(),
            sourceUpdated,
            catalog: { singles: singlesTotal, sealed: sealedTotal, groups: catalog.length },
            singles: movers(singles, 10, 60),
            sealed: movers(sealed, 25, 40),
            topSingles: singles
              .slice()
              .sort((a, b) => b.p - a.p)
              .slice(0, 40)
              .map((i) => ({
                id: i.id, name: i.n, number: i.num ?? "", set: i.g,
                market: Math.round(i.p * 100) / 100,
                change: i.pv ? Math.round(((i.p - i.pv) / i.pv) * 10000) / 100 : null,
                image: `https://tcgplayer-cdn.tcgplayer.com/product/${i.id}_400w.jpg`,
              })),
          },
          expires_at: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        },
        { onConflict: "cache_key" },
      );
    }

    // ---------- 3. GRADED index from live eBay PSA 10 medians ----------
    const { data: lastGraded } = await supabase
      .from("market_index_snapshots")
      .select("captured_at")
      .eq("market_type", "graded")
      .order("captured_at", { ascending: false })
      .limit(1);
    const lastGradedAt = lastGraded?.[0]?.captured_at ? new Date(lastGraded[0].captured_at).getTime() : 0;
    if (Date.now() - lastGradedAt >= GRADED_EVERY_MS) {
      const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ebay-pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({ queries: GRADED_BASKET, conditionIds: "3000|2750", marketType: "graded" }),
        signal: AbortSignal.timeout(45000),
      }).catch(() => null);
      const body = res && res.ok ? await res.json().catch(() => null) : null;
      const quotes = ((body?.results ?? []) as any[]).filter((r) => r.median > 0 && r.count >= 3);
      report.gradedQuotes = quotes.length;
      if (quotes.length >= Math.ceil(GRADED_BASKET.length / 2)) {
        const value = quotes.reduce((s, q) => s + q.median, 0) / quotes.length;
        // Day change vs the graded snapshot closest to 24h ago (real stored observation).
        const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { data: base } = await supabase
          .from("market_index_snapshots")
          .select("value, captured_at")
          .eq("market_type", "graded")
          .lte("captured_at", dayAgo)
          .order("captured_at", { ascending: false })
          .limit(1);
        const baseVal = base?.[0]?.value ? Number(base[0].value) : null;
        snapshots.push({
          market_type: "graded",
          value: Math.round(value * 100) / 100,
          change_pct: baseVal ? Math.round(((value - baseVal) / baseVal) * 10000) / 100 : null,
          constituents: quotes.length,
          source: "ebay browse (active PSA 10 medians)",
          meta: {
            basket: quotes.map((q) => ({ q: q.query, median: q.median, n: q.count })),
            listings: quotes.reduce((s, q) => s + (q.count || 0), 0),
          },
        });
      }
    }

    if (snapshots.length) {
      const { error } = await supabase.from("market_index_snapshots").insert(snapshots);
      if (error) console.error("insert snapshots", error.message);
    }
    report.snapshots = snapshots.map((s) => `${s.market_type}=${s.value}`);
    return json({ ok: true, ...report });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e), ...report }, 500);
  }
});
