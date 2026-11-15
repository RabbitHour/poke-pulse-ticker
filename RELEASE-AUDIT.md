# Collector release update — November 5, 2026

This update supersedes the earlier status below.

- Reconciled current origin/main with the preserved local work on fix/collector-launch-20261105. Kept remote Cloudflare SPA configuration and authentication-storage improvements.
- Added a Pokémon-focused hero, large search field, card-art fan, brighter surfaces and restrained image enhancement.
- Replaced “Search full catalog” with “Browse cards & sealed products”; it targets the catalog search field. Hero searches share URL query state with that catalog.
- Fixed exact-phrase matching: “Mew 30th Anniversary” matches the official 30th Celebration name, accepts reordered words and card numbers, and does not confuse Mew with Mewtwo.
- Added an explicit value-search form/button. Known cards without prices stay visible and cannot produce a fabricated total.
- Catalog and sealed-index loading can recover from missing/HTML/stale hosted JSON using the repository's existing public market-data branch.
- Added .gitattributes for consistent source/script line endings. Generated catalog and old dependency backup directories are locally excluded, preserved on disk.
- Tests: 40 application tests passed, plus 4 history/cache tests. Production build passed. Large-bundle and Browserslist warnings remain.
- Read-only backend checks: raw, graded and sealed history each returned HTTP 200 with latest snapshots 2026-11-05 14:10 UTC. Email signup enabled; confirmation required. This does not verify SMTP inbox delivery.
- Public data branch returned 57,921 records with source release 2026-11-04 20:06 UTC. Four Mew/Mew ex 30th Celebration entries were present; one had a provider price and three had no price. These are provider observations, not every worldwide printing.
- create-checkout source now requires test-mode keys, server-approved CHECKOUT_TEST_PRICE_IDS and CHECKOUT_TEST_ALLOWED_ORIGINS, a confirmed user and an active recurring test price. Browser-supplied coupons/trials are rejected. This function has not been deployed; live payment behavior is not certified. Other legacy payment endpoints were not exercised or certified.

Service access limitations:
Lovable connection reports reauthentication required. Computer Use stopped because it could not reliably determine the browser URL. No account credentials were created/rotated, no email sent, and no payment session created. Cloudflare/R2 exposed credentials still require owner rotation and secret-store replacement; never paste replacements into chat. Backend deployment and complete signup/checkout testing require authenticated service access.

Visual layout has been implemented and built, but browser-based visual/interaction acceptance was blocked by Computer Use. Tests exercise form submission and data matching, not a complete hosted browser session.

---
# Audited PyCharm release workflow — 2026-11-05

## What changed
- DailySpotlight displays finite positive provider quotes, rotates hourly while open, and handles missing quotes. Removed fabricated volume, RSI, support/resistance, and buy/sell advice.
- Raw heatmap renders zero and nonfinite changes neutrally.
- Added three regression tests and scripts/release.ps1 plus scripts/verify-hosts.mjs.
- Existing local edits in MarketOpening.tsx and Index.tsx were preserved.
- No checkout, charge, email, secret rotation, backend deployment, merge, commit, or push was executed.

## Verification
29 Vitest tests and 4 Node history/service-worker tests passed. Production build passed.
PowerShell parser and Node syntax checks passed. Build warns about large chunks and old Browserslist data.

Read-only host checks:
- www.pokepulseticker.com: request failed from this environment.
- pokepulseticker.com: HTTP 403.
- poke-pulse-ticker.lovable.app: served HTML references a different build asset.
These results do not establish a global outage. None of the three hosts is verified to serve this local build.

GitHub fetch succeeded. Local release/catalog-discovery at 2c1be28 and origin/main have diverged.
The local branch includes a707d33 and 2c1be28; remote main includes other Lovable/Cloudflare fixes.
Do not replace either side with a reset or force push. Review both sides before merging.

## Run in the PyCharm PowerShell terminal

Use Node 24 as in the existing CI workflow. Python is not required.
The script exits immediately when a command fails. Each phase is intentional and separate.

~~~powershell
Set-Location 'C:\Users\noyes\PycharmProjects\Poke-Pulse-Ticker-GitHub'
.\scripts\release.ps1 -Step Audit
.\scripts\release.ps1 -Step Prepare -Branch fix/verified-market-release-20261105 -PreserveLocalChanges
.\scripts\release.ps1 -Step Test
.\scripts\release.ps1 -Step Review
~~~

Prepare fetches origin and creates a NEW branch from current HEAD. PreserveLocalChanges explicitly carries your current edits without stashing, resetting, or merging. Use a different new branch name if this one exists.

Dependencies already worked during this audit. For a fresh clean checkout, run npm ci first and check its exit code. Do not run dependency upgrades as part of release verification.

Inspect the changed and new files in PyCharm. Review excludes full file contents from terminal output to avoid accidental secret disclosure. Stage only these audited additions/changes:

~~~powershell
$releaseFiles = @(
  'src/components/DailySpotlight.tsx',
  'src/components/DailySpotlight.test.tsx',
  'src/components/SetHeatmap.tsx',
  'scripts/release.ps1',
  'scripts/verify-hosts.mjs',
  'RELEASE-AUDIT.md'
)
.\scripts\release.ps1 -Step Commit -Paths $releaseFiles -Message 'Show observed spotlight quotes and add guarded release verification'
~~~

Commit refuses existing staged changes and reruns tests/build before staging. Review and commit your pre-existing MarketOpening.tsx and Index.tsx edits separately. Untracked dependency backup folders and public/data are preserved. They block the Push phase's clean-tree check; keep them out of commits. For this checkout, add these local-only patterns to .git/info/exclude after reviewing them:
- /node_modules.before-release-*/
- /public/data/

The generated public data is managed by the existing market-data branch. Do not publish it accidentally on the application branch. Local exclusions do not delete files or change GitHub ignores.

Once intended local changes are committed and status is clean:

~~~powershell
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed' }
git log --oneline --left-right HEAD...origin/main
git merge --no-commit --no-ff origin/main
if ($LASTEXITCODE -ne 0) { throw 'Resolve the merge conflicts in PyCharm before continuing' }
~~~

Review the merge carefully, especially Cloudflare routing/configuration, catalogs and landing-page features. Resolve any conflicts without discarding either side. Run the Test phase, then complete the merge with git commit only after reviewing the staged merge. If Git says already up to date, no merge commit is needed.

~~~powershell
.\scripts\release.ps1 -Step Test
.\scripts\release.ps1 -Step Review
# Only when a reviewed merge is pending:
git commit -m 'Integrate reviewed main changes'
# Then:
.\scripts\release.ps1 -Step Push
~~~

Push rejects main/master/market-data, detached HEAD, dirty files, or a branch that does not contain current origin/main. It fetches again, tests/builds again, and uses a normal feature-branch push. If remote changed in the meantime, repeat the review/merge. Never force push.

Open a GitHub pull request from the feature branch to main. Inspect the complete diff, including earlier local commits, and successful CI checks before merging. A feature branch push itself does not deploy.

## Deployment verification
The existing market-update.yml can deploy main to Cloudflare only when its configuration and secrets are present. Its build job can succeed while deployment is skipped. Inspect the actual deployment step, deployment URL, commit, and provider status. Supabase functions/configuration are separate deployments. Lovable publishing/custom-domain configuration must be checked separately; GitHub synchronization is not proof of a published site.

Do not invoke scripts/prepare-cloudflare.mjs using credentials from the notes.
The exposed Cloudflare API token and R2 credentials require revocation and replacement by their owner. This task did not use, reproduce, or rotate those values. Store replacements in provider/GitHub secret settings.

Build the exact reviewed revision using the same public build settings as hosting, then:

~~~powershell
.\scripts\release.ps1 -Step Verify
~~~

The verifier checks every host independently, follows only expected-host redirects, compares referenced entry JS/CSS bytes with local dist, checks /account serves an application shell, and validates a nonempty catalog with a source timestamp within 72 hours (up to one hour of clock skew). A different build configuration can produce different assets; investigate rather than suppressing failures. It does not prove browser execution, all lazy chunks, email delivery or payment success.

## Feature audit and browser acceptance
| Area | Code evidence / remaining acceptance |
| --- | --- |
| Core raw/graded/sealed charts | MarketOverview/useMarketIndexes read stored Supabase observations; IndexDayChart requires actual history. Confirm each category loads, timestamps are current, 1D/5D/1M work, and missing history stays explicit. |
| Five sealed charts | SealedCategoryCharts reads /data/sealed-indexes.json with fixed baskets. Confirm data file exists and each basket has enough observations; no historical backfill was invented. |
| Heatmaps | SetHeatmap uses loaded raw cards; SealedBoxHeatmap uses observed sealed products. Zero-change color fixed. Verify filters, empty categories, sample scope and product classifications. |
| Ticker | Catalog-backed categories, pause/resume and paging already exist. Check raw/graded/sealed/digital selection and quote links; missing quotes must not become zero. |
| Catalog | Static catalog plus observed graded records; coverage is provider-specific, not every printing/language. Search exact name/set/number/variant and inspect quote dates. Graded observations are asking-price medians, not sold prices. |
| Featured cards | Preserved existing rotating catalog spotlight. Fixed the separate DailySpotlight's fabricated metrics and hourly rotation. Check artwork fallback and exact printing details. |
| Ask Poke | PokeHelp is local catalog matching and guide text, not an AI model call. Test examples, no-match and exact-item links. Category words are currently removed from matching tokens, so category-specific filtering still needs improvement. |
| Authentication email | AccountForm calls Supabase signUp and password reset with origin/account redirects. Confirm allowed URLs on all hosts and SMTP settings; perform inbox confirmation, expired-link and recovery tests with an owned test account. No delivery verified here. |
| Stripe sandbox | Older create-checkout accepts client price/trial/coupon and uses STRIPE_SECRET_KEY without enforcing test mode. Do not exercise it against an unknown/live project. Use an isolated test backend, test credentials and matching test prices; enforce server-owned prices/trials/coupons and allowed return origins before enabling it. Test success, decline, cancel, subscription entitlement, webhook replay and portal ownership. No live billing enabled or payment endpoint called. |

Remaining work: reconcile remote main with preserved edits; improve Ask Poke category filtering; audit legacy checkout server controls; verify live backend history coverage, authentication delivery, and sandbox billing in configured services. This patch is a verified local increment, not a claim that every feature or host is complete.
