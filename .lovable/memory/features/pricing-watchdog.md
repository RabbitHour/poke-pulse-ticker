---
name: Pricing Health Watchdog & Daily Source Rotation
description: Multi-source pricing engine with daily free-API rotation, failover, and live signal-strength monitoring
type: feature
---
- **Daily rotation:** `pokemon-proxy` picks today's PRIMARY free source by `floor(Date.now()/86_400_000) % SOURCES.length` (currently pokemontcg.io ↔ TCGdex), then fails over through the rest in order. Prevents rate-limit bans/disconnects from hammering one provider.
- **Failover chain:** pokemontcg.io (3 retries, 429 backoff) → TCGdex (`supabase/functions/pokemon-proxy/tcgdex.ts`, keyless, normalizes to pokemontcg.io shape). Empty `data` arrays count as failure and advance the chain.
- **Response metadata:** proxy returns `_source`, `_sourceOrder`, `_attempted` so the UI/watchdog can see who served the data.
- **Client fast lane:** `fetchTopHoloCardsQuick` hits api.pokemontcg.io directly (6s timeout) for first paint, then falls back to the proxy (and thus the rotation) on any failure or empty result.
- **Watchdog:** `pricing-health` edge fn probes all sources every 5 min via pg_cron, caches in `index_cache` (key: `pricing_health`) with `primarySource`, `sourceOrder`, `rotatesAt`.
- **Sources probed (10):** tcgplayer(pokemontcg.io), tcgdex, ebay (OAuth), pricecharting*, cardladder*, probstein, 130point, pokemonio/rarecandy/pokescope (Firecrawl). *=key required.
- **Signal strength:** `(liveSources / totalSources) * 100` — green ≥67%, yellow 34-66%, red <34%.
- Missing sources are skipped, never fabricated as live.
