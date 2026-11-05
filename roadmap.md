# Live market index completion

## Production image coverage and forecast lifecycle
- [ ] Add bounded exact-ID provider discovery with durable last-good images
- [ ] Show image provenance, coverage/missing counts and reduced-motion foil sparkle
- [ ] Verify persisted forecast eligibility/scoring with targeted tests and live ledger checks
- [ ] Verify both-host catalog delivery and browser lookup/images; use existing GitHub sync only

## Production catalog hotfix
- [x] Verify Bun 1.2.15 clean frozen install, isolated Vite/Rollup tooltip bundle, automatic full-app build and 57,921 generated catalog records; Cloudflare main deployment not run here
- [x] Restore latest durable catalog into Worker and Lovable builds using same-origin generated shards
- [x] Preserve half-hour checks and source-release timestamps
- [x] Verify production-like catalog lookup, exact record links and visible images (static files with host-specific fallback blocked)

- [x] Add protected persistent index snapshot storage
- [x] Record real eBay raw, graded, and sealed aggregate snapshots
- [x] Expose read-only index history to the public charts
- [x] Replace synthetic graded and sealed homepage values
- [x] Remove generated chart curves and static pricing fallbacks
- [x] Make ticker source-strict and retain 30-minute refresh
- [x] Verify build, runtime behavior, and visible coverage labels

# Preview engine refresh (no publishing or DNS changes)
- [x] Verify / renders and fix runtime crashes
- [x] Refresh compact artwork hero, search/value lookup, and dense sections
- [x] Correct ticker rotation, exact variant links, timestamps, chart states and home links
- [x] Preserve source prices, half-hour checks, daily TCGCSV release distinction and verified movers
- [x] Extend existing forecast ledger/UI across cards, sets, sealed and requested horizons; eligible outcome accuracy only
- [x] Run relevant tests and desktop/mobile browser smoke
- [x] Audit www.pokepulseticker.com, pokepulseticker.com and published Lovable address without changing them
- [x] Existing project access retained; user declined an extra account connection

## External dependencies
- [ ] Real forecast outcomes: awaiting eight distinct daily observations and future due dates; no results backfilled.
- [ ] Custom domains: www has no DNS response; apex requires Cloudflare Access sign-in. No changes authorized.
- [ ] Local :5182 reproduction: unavailable in this sandbox; / and /index verified on managed preview :8080.
