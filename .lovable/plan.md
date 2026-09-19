# Finish truthful live market indexes

## Goal
Replace every synthetic RAW, GRADED, and SEALED graph/index value with observed market quotes, preserve 30-minute refreshes, and never present fabricated history.

## Changes
- Build the graded index only from real eBay graded-card quote medians and their stored 24-hour comparisons.
- Build the sealed index only from real eBay sealed-product quote medians and their stored 24-hour comparisons.
- Keep RAW pricing sourced from the existing live TCGPlayer/TCGdex/TCGcsv pipeline; remove static homepage price fallbacks.
- Replace generated chart curves with durable timestamped index snapshots. Until enough real observations exist for a selected range, show the observed points and an “insufficient history” state rather than inventing points.
- Make ticker values source-strict: only display records with a current observed price and use real stored changes, without generated movement.
- Display actual quote coverage counts instead of claiming 1,000 products when fewer live quotes are available.
- Remove simulated pricing outputs from homepage graded/sealed tables and heatmaps.

## Technical details
- Add a locked-down `market_index_snapshots` table with timestamp, market type, value, change, constituent count, and source metadata; authenticated reads only, writes through a validated backend function.
- Add a snapshot backend function and scheduled collection path using the existing eBay and raw pricing integrations.
- Add client hooks for live benchmarks and historical observations, then wire them into the three index cards and charts.
- Retain 30-minute query refresh and card rotation behavior.
- Validate the preview, runtime/network signals, and the latest build before completion.

## Coverage boundary
“Every single card/product live” is not achievable accurately from free APIs alone: eBay’s free quota and available public catalogs cannot provide continuous graded and sealed sold-comps for the entire global catalog. This implementation will index every item actually returned by verified sources and report the exact coverage count. Full-catalog continuous indexing requires licensed bulk feeds plus substantially larger collection/storage capacity.
