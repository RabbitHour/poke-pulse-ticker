# Poké Pulse Engine — project checkpoint

Updated November 6, 2026. Repository: https://github.com/RabbitHour/poke-pulse-ticker
Existing Lovable project: https://lovable.dev/projects/48b7dba3-cd1a-4e25-8cd0-c312f5c4286c

## Landing-page refresh

- Larger symmetrical hero artwork (270 × 360 px at the verified desktop size); only headings above the artwork, metadata below. Larger central logo and title; outlined Browse sets.
- One 18-card marketplace gallery replaces the hero's yellow tiles, featured strip and separate listings section. Exact product links and eBay searches retained. Cards and descriptions use a vertical gallery layout.
- Free charts, card valuer, account/report and Ask Poke links sit beside Search values inside the valuation panel.
- Featured card feed and separate high-value list removed; high-value title now heads the existing eBay section.
- Paired enlarged raw/graded panels precede coverage, one forecast ledger, then catalog. Forecast methodology and catalog coverage details collapse while remaining accessible. Forecast imagery uses exact record IDs; separate sample art is explicitly labeled as catalog examples.
- Most Active Raw Cards uses larger whole-card art and removes failing artwork from the visible selection without substituting unrelated pictures.
- Market guide, other-market comparison and intelligence grouped; set, era and sealed performance grouped.
- Know what you're tracking precedes update, valuation link, grading calculator, portfolios and research. Duplicate grading disclosure removed. Poké Ripz is immediately above the final valuer.
- Shared CardImage prefers TCGdex high-resolution artwork, falls back to the original on failure, and applies vivid contrast/saturation. Landing text enlarged and glow removed from the header; responsive menu switches earlier to avoid overlap.

## Verification and limits

- TypeScript check passed; existing Vitest suite: 42 passed. Data/history/service worker checks: 20 passed.
- Production Vite build passed. Existing large-chunk and Browserslist-age warnings remain.
- Desktop browser: both hero slots 270 × 360; no page-width overflow; exactly one forecast heading; hero lookup populates valuer; Charizard selection produces its $2,999.99 reference estimate from the loaded release.
- Mobile breakpoints are implemented; dedicated mobile browser verification remains outstanding.
- TradingView market-overview embed integrated following https://www.tradingview.com/widget-docs/widgets/watchlists/market-overview . Includes S&P/Nasdaq reference CFDs, gold reference CFD and Bitcoin/USD. Provider delays are disclosed. The preview could not load its external script; real-time delivery is NOT verified, and synchronized Pokémon correlations are NOT implemented. Failure displays a source link, never invented quotes.
- Provider source image quality still limits detail. Color adjustments cannot recover detail absent from originals. Exact graded listing/certificate photographs remain provider-dependent.
- ChatGPT sidebar Project creation was blocked by browser host policy. This repository checkpoint is not a claim that a ChatGPT Project was created. Create “Poké Pulse Engine” in the sidebar and move the working chat into it manually.

## Hosting and domain status

The existing main-branch GitHub market-update workflow builds the app and deploys Cloudflare Pages only when its configured token/account/project are present. Lovable has a separate Publish/Update step. A Git push alone does not prove that either host has published.

Requested primary domain: https://www.pokepulseticker.com/ (also apex pokepulseticker.com).
Other supplied names: www.pokepusleticker.com (transposed spelling), www.poke-pulse-ticker.com and poke-pulse-ticker.lovable.dev.
The repo and existing public response identify https://poke-pulse-ticker.lovable.app as the Lovable URL. Do not silently treat .dev and .app, or the transposed spelling, as the same domain.

Direct checks from the execution environment: primary apex/www returned 403; transposed spelling and .lovable.dev returned 503; hyphenated www returned 421; .lovable.app returned 200. These are environment observations, not proof of global outages. DNS ownership/alias configuration has not been changed.

## Continue in PyCharm

Open this repository in PyCharm and use its PowerShell Terminal. Run each command individually, pressing Enter. Do not paste the prompt prefix. First inspect `git status --short`; commit or stash your own outstanding work before switching branches.

```powershell
git remote get-url origin
git status --short
git fetch origin
git switch --track origin/refresh/vivid-landing-2026-11-06
npm ci
npm test
npm run build
npm run dev
```

If the local refresh branch already exists, use `git switch refresh/vivid-landing-2026-11-06` instead of the `--track` command. Open the Local URL printed by Vite. Ctrl+C stops the dev server.

After reviewing the refresh, merge and push from this repository (requires a clean working tree):

```powershell
git switch main
git pull --ff-only origin main
git merge --no-ff origin/refresh/vivid-landing-2026-11-06 -m "Refresh Poké Pulse landing page layout and vivid artwork"
npm test
npm run build
git push origin main
```

Stop if a command fails. Do not push after a failed test/build or unresolved conflict. The build hydrates public/data; do not use `git add .` to mix generated data with unrelated work. Check GitHub Actions after pushing, then publish/update the existing Lovable project and verify each configured domain. Main protection may require merging the pull request instead of the terminal merge.
