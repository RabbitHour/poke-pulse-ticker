# Poke Pulse validation — November 19, 2026

## Automated validation
- 82 frontend tests passed, including changing discovery seeds, set diversity, daily full-pool selection, ticker ordering/reopen, durable-catalog recovery and exact saved-card behavior.
- 23 Node/data tests passed, including a repository-wide check that literal internal page links have registered routes.
- `npx tsc -p tsconfig.app.json --noEmit` passed.
- Production Vite build passed with 58,059 catalog records and source release 2026-11-18T20:05:56+0000. Existing large-bundle warning remains; bundle splitting is a follow-up performance task.

## Browser preview checks
31 secondary routes rendered their expected headings or intentional gates:
`/account`, `/memberships`, `/portfolio`, `/dashboard`, `/watchlist`, `/alerts`, `/releases`, `/videos`, `/promo`, `/set-completion`, `/guides`, `/trade`, `/command-center`, `/profile`, `/contact`, `/methodology`, `/terms`, `/privacy`, `/legal-protection`, `/sim-trader`, `/arena`, `/pokemon-kids`, `/ripz`, `/pricing`, `/blog`, `/capital-campaign`, `/capital-dream`, `/franchise`, `/blueprint`, `/donate`, `/pulse-wallet`.

Additional public journeys checked:
- Home gallery Reshuffle changed the visible 18-card selection across sets.
- Ticker displayed multiple sets in alphabetical order; a reload changed the starting letter (C to D in the observed check). Automated tests cover continuous frame movement, boundary transitions and pause/resume.
- Hero mover and Card of the Day used different sets (Delta Reign and Steam Siege in this release).
- Browse Sets loaded 255 catalog set groups (provider IDs can represent separate groups for the same named set; this is not a claim of 255 unique official expansions).
- Set → Base Set → exact Charizard Holofoil record retained set, number, quote date and variant.
- Exact-card save → daily checklist → $1,100 target showed the $1,001.05 reference quote as at/below target. These are local test inputs, not investment recommendations or real account holdings.
- Trade lookup returned separately labeled Base Set and Base Set 2 records. Selecting Base Set Holofoil added the quoted $1,001.05 total without substituting another printing.
- All ten distinct/duplicated home hash links inspected pointed to existing section IDs.

## Findings repaired
- Fixed deterministic discovery, first-24 hero selection and repeated ticker printings.
- Removed the set browser's dependency on a separate proxy and connected set-index links to real catalog set pages.
- Kept saved quotes available even when a card falls outside the collector highlight/image filter.
- Added cross-route section scrolling and browser-local checklist links on account-gated watchlist/alert pages.
- Replaced outdated methodology/sample/weighting claims and removed unsupported release-calendar seed entries. Forecast UI now explicitly states when the unchanged-value baseline is better.

## Verification limits
A heading/route pass is not an authenticated workflow or content audit. No accounts were created, no user holdings were seeded, no terms accepted, no messages sent, and no paid or gaming transactions performed. Account synchronization, email/push delivery, checkout, every external listing, all media downloads, every catalog record/image, installed-PWA updating and mobile device behavior are not fully verified by these checks. Promo terms and account gates were intentionally left intact.

Lovable still displayed “Some services are paused because this workspace is out of credits” during this check. Source edits use the existing GitHub integration. Production domain parity must be verified independently of these local tests and of a successful build; no DNS or security settings were changed.
