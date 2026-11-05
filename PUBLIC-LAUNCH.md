# Poke Pulse: public launch and PyCharm guide

The source repository is RabbitHour/poke-pulse-ticker. Keep its existing visibility. The public website will be on Cloudflare Pages, with GitHub Actions building and publishing it. Do not use GitHub Pages for this commercial service.

## Run locally in PyCharm (Windows PowerShell 5.1)

Open the project folder C:\Users\noyes\PycharmProjects\Poke-Pulse-Ticker-GitHub. In its terminal:

```powershell
Set-Location 'C:\Users\noyes\PycharmProjects\Poke-Pulse-Ticker-GitHub'
npm run market:sync
npm test
node --test scripts/record-history.test.mjs scripts/service-worker.test.mjs
npm run build
npm run dev -- --host 127.0.0.1 --port 5182
```

If port 5182 is already serving the site, keep that terminal open and refresh the browser. Do not start a second server on the same port. The website needs Node 24. For local continuous updates, open a second PyCharm terminal and run `npm run market:watch`. The public site does not need your computer left on once the GitHub workflow is active.

## One-time Cloudflare setup

1. Sign in to https://dash.cloudflare.com/ and create a **Pages Direct Upload** project named **poke-pulse-market**. GitHub Actions supplies prebuilt files; Cloudflare Git integration is not needed. Keep the free plan. If the name is unavailable, choose another and use that exact name in step 4.
2. Create an account-scoped API token with **Cloudflare Pages: Edit** for this account only. Copy it directly into GitHub's secret field below. Never paste it into chat, source code or a terminal command.
3. In https://github.com/RabbitHour/poke-pulse-ticker/settings/secrets/actions create repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` using your Cloudflare token and account ID.
4. In the repository's Actions **Variables** tab add `CLOUDFLARE_PROJECT` with value `poke-pulse-market` (or the actual project name). Public Supabase browser settings already live in this existing repository's Vite environment file; never put a service-role key there. If you move these settings into repository variables, explicitly export them during the build.
5. Ensure the launch changes are merged into **main**. In Actions select **Unattended market updater**, **Run workflow**, branch **main**. The first run may take several minutes to download the catalog. Its Cloudflare deployment output is the authoritative public URL; the expected default is https://poke-pulse-market.pages.dev/ if that project name is available. Do not announce it as live before the run succeeds.
6. Open the returned URL. Check catalog and Pocket counts, raw/graded/sealed chart timestamps, image loading, a specific card lookup, account links and a direct `/account` reload. Add the exact Cloudflare origin and `/account` recovery URL to Supabase Authentication URL Configuration. Email sign-up and recovery need a real delivery test using your own account.

Cloudflare docs: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/ and https://developers.cloudflare.com/pages/configuration/api/

## What the unattended workflow does

- Checks public providers at minutes 7 and 37 each hour. GitHub schedules can be delayed; this is not guaranteed real-time data. TCGCSV publishes daily, so repeated checks cannot produce fresher source prices.
- Downloads public catalogs using bounded concurrency and retries. If any product group fails, it preserves the previous published catalog and fails the run. Existing deployed files continue serving.
- Keeps a dedicated **market-data** branch containing only public catalog/history/forecast files. No customer records or credentials go there. The branch is the durable history store; disposable Actions download caches are only an optimization.
- Saves at most one daily snapshot per new provider release. Retains 400 daily quote snapshots. A first capture is not a historical backfill. The raw and sealed histories use exact variant IDs. Graded per-item history is not connected yet; existing aggregate graded charts still use backend observations.
- Maintains the five fixed-basket sealed indexes. Missing constituents prevent a new point; no replacements or invented old returns.
- Adds Pocket digital entries separately, with symbols beginning PKT and **no cash valuation**. Current source has 2,480 such English entries; counts can change.
- After eight daily observations spanning seven days, records experimental seven-day log-trend forecasts for up to 20 eligible raw cards per observation. Original forecasts are never rewritten. Later results are stored separately, against an unchanged-price baseline. Evaluations require a newer provider release within two days after the target. Missing outcomes stay unscored. This is a new experimental record, not independently audited past performance.
- Builds and deploys changed data plus current main source. Cloudflare credentials are used only during deployment. No third-party API key is needed for catalog updates.

Review Actions failures and usage periodically. Private repositories have monthly included runner minutes and storage limits. Do not enable paid overages just to run this workflow; check your account's allowance. Data volume grows over time. Cloudflare's free tier also has limits. No unlimited-free operating promise is made.

## Optional $2.99 monthly collection reports

The new `collection-report` edge function and UI are prepared, but **billing defaults off**. The server checks a confirmed Supabase account, the Stripe customer owner, an active exact-price subscription and current server-fetched quotes on every export. It rejects digital cards, arbitrary client prices, duplicate IDs and invalid quantities, and neutralizes spreadsheet formulas in CSV text. The catalog builder and price lookup remain free.

Before activation:

1. Deploy `supabase/functions/collection-report/index.ts` to the existing Supabase project. Keep gateway JWT verification and the function's own account verification enabled.
2. In Supabase's secret manager configure `REPORTS_ALLOWED_ORIGINS` as the exact published origin, `REPORTS_CATALOG_URL` as that origin plus `/data/catalog.json`, and `REPORTS_PRICE_ID` as a real USD 2.99 per month recurring Stripe price. The function verifies this amount and interval instead of accepting a price from the browser.
3. Use the existing `STRIPE_SECRET_KEY` in Stripe **test mode** first, with a matching test price. Set `REPORTS_ENABLED=true` only in that test environment. Configure Stripe's customer portal. Test subscribe, export, duplicate subscribe, cancellation, expired access, unauthorized export and billing portal ownership. No real charge is needed for testing.
4. Review the result before switching to live Stripe credentials and the live price. Only then build the public frontend with `VITE_REPORTS_ENABLED=true`. Until then the panel shows a preview and has no active purchase control. Taxes, terms, refund policy and billing support need your business settings.

The old pricing routes and checkout functions predate this upgrade and have not received a complete payment/security audit. They are not proof that this new reports feature has been activated. This change does not certify the entire application as secure.

## Future code updates from PyCharm

Keep changes on your current working branch. First inspect `git status --short`. Stage only files you intend to publish; the existing local package-lock.json was validated and included because the old GitHub lockfile could not install the current dependencies. Commit them, then fetch and merge the current remote main before pushing. Never use force-push to resolve a mismatch.

```powershell
git status --short
git fetch origin
git merge --no-edit origin/main
npm test
node --test scripts/record-history.test.mjs scripts/service-worker.test.mjs
npm run build
git push origin HEAD
```

These commands assume your intended edits have already been committed. If Git reports uncommitted changes or conflicts, stop and resolve those before pushing. A merge into main starts the website updater/deployment; a feature branch push runs verification only. The scheduled updater never changes application source or your local files.

## Cross-host catalog builds

`npm run build` prepares the latest public `RabbitHour/poke-pulse-ticker` **market-data** catalog before Vite copies static assets. `wrangler.jsonc` uses this same build command for Workers; the existing Pages workflow still deploys the prepared `dist`. Lovable builds use the identical Vite preparation hook. The catalog is shipped as `/data/catalog.json` plus content-hashed `/data/catalog/*.json` shards, each below 1 MB. No browser catalog request depends on a Lovable asset URL. A validated bundled release remains available if GitHub cannot be reached; a build without any complete catalog fails instead of shipping zero results. Source timestamps are copied unchanged, and the half-hour updater continues to check for distinct daily TCGCSV releases.

## Browser caching

The public-shell service worker now bypasses authenticated API responses and market JSON, and fetches navigation HTML from the network first. Older Poke Pulse caches are removed during activation. This prevents one signed-in account’s cached API response from being reused for another and allows new deployments to appear on refresh.

## Known limits

Source coverage is English/provider-specific, not every worldwide language and printing. Some image mappings and graded/sealed pictures remain unavailable. Per-item history begins now and is not a record of actual completed sales. Old research and game panels still include modeled/simulated data and are labeled accordingly. Keep these separate from measured forecasts. Existing large JavaScript bundles and third-party dependency maintenance remain follow-up work. A passing build is not an end-to-end security or email/payment certification.
