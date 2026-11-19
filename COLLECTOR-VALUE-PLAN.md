# Poke Pulse: collector value and daily return plan
Updated November 19, 2026. Applies to pokepulseticker.com, www.pokepulseticker.com, configured alternate domains, and the installable web app.

## The reason to use Poke Pulse
See what changed, understand the evidence, and decide which exact cards or sets deserve a closer look. Help a collector research purchases and follow a collection with less searching. Help a market-focused collector compare dated observations without presenting asking prices, estimated values, or model output as realized returns.

This is a product hypothesis, not proof of customer demand or profitability. Validate it with collectors and repeat-use measurements. Rarity alone does not imply value, liquidity, or price appreciation; commons and uncommons remain searchable even though the collector ticker excludes them.

## First release: useful daily decisions
1. Lead with an English collector ticker and a daily check-in. Limit card eligibility to explicit illustration rare, special illustration rare, ultra rare, promo, full-art/alternate-art, documented special rarities and Trainer/Galarian Gallery identities. Do not infer rarity from price or an ordinary holographic finish. Retain provider rarity in the catalog updater; when metadata is absent, only explicit product descriptions qualify. Coverage will be incomplete until the updated data pipeline publishes the metadata.
2. Require English artwork and positive source quotes for the ticker and daily collector features. Remove a card from these image-led sections when its image fails. Do not substitute unrelated art. For graded records elsewhere, retain the grade, exact identity, quote and sample while displaying matching raw artwork.
3. Show actual daily comparisons for identical records across consecutive source-release days. Rank daily highlights by absolute dollar movement, with gainers and decliners filters; show both dollars and percentages. This avoids making tiny penny changes the default headline.
4. Add My Saved Cards, per-card buy targets, and change since the visitor marked a release reviewed. The first release stores up to 50 exact records in this browser on this domain. Targets are evaluated on page visits. No push notification, background alert, account sync or cross-domain persistence is claimed.
5. Feature existing fixed-basket set indexes with actual archived values and daily changes. Use index points (base 100), not a fabricated complete-set dollar price. Require complete basket coverage at recording and both dated releases for comparison. A future ticker mode may rotate these set names and index points.
6. Keep exact-record detail links, quote dates, available sample counts, and source limitations visible. Preserve leaders in ranked sections while using varied cards in discovery sections.
7. Keep one cohesive card-discovery/marketplace area, boxed Browse Sets links, larger equal-height hero cards, vivid artwork and readable contrast. Place experimental forecasts and secondary analytics below the daily decision tools.
8. Remove placeholder-derived watchlist signals. Do not label a static price release as intraday live movement.

## Landing-page order
Hero and search → English collector ticker → daily collector check-in → saved cards and targets → set index pulse → value lookup → varied cards and marketplace discovery → coverage and market overview → broader leaders/catalog → forecasts, educational tools and secondary analytics.

## Why return tomorrow?
- A new dated source release changes the daily comparison.
- A saved card reaches or approaches a personal price target.
- A collector sees the change since their reviewed release.
- A set index changes relative to its fixed baseline.
- Exact printing and variant details make a purchase comparison faster.

## What would justify multiple visits per day?
The current price source alone does not. Add these only when a legitimate feed, permissions, freshness and operating cost are established:
- New matching marketplace listings, clearly labeled asking prices, with seller, shipping and listing time; do not call them deals without a comparable total-price basis.
- Licensed or permitted sold-price observations, with condition, sale date, sample size and outlier handling.
- A timestamped news digest linking to original announcements and explaining the affected sets/cards; distinguish confirmed releases from rumors. Do not manufacture news from price movements.
- Opt-in notifications for a genuinely new event, with deduplication, quiet hours and an unsubscribe control.

No artificial urgency, invented volume, false scarcity, synthetic price updates or guaranteed-return language.

## Next phases and dependencies
### Exact collection and synced watchlists
Unify account watchlists with catalog IDs and variants; migrate legacy card-only entries by asking users to choose a printing where ambiguous. Add purchase cost, quantity and condition. Show collection estimates separately from realizable proceeds after fees/shipping. Keep browser-only saving available without registration. Requires schema migration, row-level access tests and cross-device verification.

### Better market evidence
Expand graded observations through permitted providers; publish true quote/listing counts and coverage gaps. Keep fixed index baskets historically stable. Do not enlarge a displayed sample by repeating records. Add liquidity or turnover measures only when transaction data supports them.

### Set research
Let users inspect index constituents, baseline date, missing coverage and historical drawdowns. Add set-completion cost only with a declared checklist, selected variants/condition, and quote coverage. Do not confuse basket performance with a complete set valuation.

### News and alerts
Select lawful sources and provider quotas first. Then implement original-source links, timestamps, relevance to saved cards/sets, and notifications. This is future work, not a currently operating news or notification service.

## Website and app release
The repository contains a PWA (manifest + service worker), not a separately verified native iOS/Android app project. Its deployed code serves the installed web app. Update the manifest branding and verify online update behavior. Keep the same domain when testing local saved cards. Native app-store delivery requires the actual native project and release access, if one exists.

Publish through the existing RabbitHour repository and Cloudflare/Lovable integrations. Verify each configured host and installed PWA against the same source revision. A successful local build, PR or merge is not proof of deployment. Do not change DNS/security rules merely to get around a browser verification challenge.

## Acceptance checks
- Ticker: A–Z ordering, elapsed-time resume, smooth wrap, keyboard pause, reduced motion; no common/uncommon, digital or non-English entries in collector mode.
- Eligibility: provider rarity or explicit description; unknown rarities fail closed. Failed artwork is removed from ticker/daily image slots.
- Daily changes: exact IDs, matching current quote, consecutive source-release days; missing data yields unavailable, never an invented zero.
- Saved cards: persistence, target editing, remove, storage-denied message, and exact variant links. State explicitly that first-release storage is device/domain-local.
- Sets: index points and source dates, complete-basket recording, no fabricated dollar valuation.
- Coverage: distinct quoted records and comparable records differentiated from visible tiles; graded observations never inflated.
- UI: hero symmetry; readable text; gallery variation; desktop and mobile checks.
- Release: frontend tests, data-script tests, TypeScript, build; then hosting checks and PWA online update verification.

## Validate value with collectors
Run a small pilot before making commercial claims. Ask collectors to find an exact card, save a target, identify a dated change and explain a set index. Record task success and misunderstandings. With consent and a documented privacy approach, measure first saved card, repeat visits after a new release, exact-detail engagement, target use, broken-image rate and stale-data rate. Interview returning and non-returning users. Define retention targets from an observed baseline rather than inventing success figures.

## November 19: discovery, navigation and engine quality
- Discovery now changes on visits and on an explicit Reshuffle action. Sets are visited in rounds before repeating and names are deduplicated; prices remain untouched.
- Card of the Day selects from the full eligible pool, rotates sets by UTC day and avoids the hero mover's set where another set is available. Yesterday's mover remains the measured leader rather than a randomized claim.
- The ticker selects one printing per name, balances set exposure, preserves A–Z and elapsed-time animation, and starts a new opening on a different available letter. Keyboard pause and reduced-motion preferences remain respected.
- Catalog delivery checks the durable published manifest and uses the newest complete version, retaining the bundled release if fresh shards are incomplete. Same-date rarity metadata upgrades can be used without a host rebuild.
- Browse Sets and trade search use catalog records; set-index links deep-link to constituent-set browsing. The methodology page now describes actual calculations rather than old sample targets or unimplemented provider weighting.
- Removed unsupported hardcoded release-calendar entries. Official news is linked; automatic news ingestion is not yet active.

## What value we can defend now
A collector can identify a printing, inspect its dated quote/history, save a target, and return after a new release to see what changed. Discovery adds breadth; it is not the core evidence of investment value. Pricing research should take fewer steps and expose uncertainty rather than conceal it. No claim of being ahead of competitors is justified without a comparative evaluation.

## Engine improvement order and acceptance criteria
1. **Valuator reliability:** measure exact-match success on an independently reviewed collection of printing/variant queries; log missing coverage, timestamp age and artwork failures without storing personal collections. Never infer condition from artwork. Expand permitted sold-price sources only with provenance, condition and sample counts; distinguish quotes, asking prices and sales. Pass identical-card/alternate-printing rejection tests before adding a provider.
2. **Tracker continuity:** make browser-saved cards useful across all priced physical catalog records. Next implement authenticated exact-ID syncing with row-level access tests, quantities and cost basis; migrate ambiguous old records explicitly. Add notifications only after verified delivery, consent and deduplication. Do not seed a user's account with pretend holdings.
3. **Predictor evidence:** retain immutable issued forecasts and honest out-of-time outcomes. Compare average absolute percentage error, dollar error, direction and coverage against unchanged-price and simple historical baselines on identical records and horizons. Split evaluation by set/era, price tier and liquidity only when observed transaction data supports it. Overlapping horizons and repeated cards are not independent samples.
4. **Promotion gate:** a candidate model must improve on the frozen baseline across successive held-out windows, keep or improve coverage and calibration, and survive regression tests before replacing the production model. Keep a versioned rollback. Do not tune on the final holdout or delete losing predictions. Publish results even when the unchanged-price baseline wins.
5. **Daily usefulness pilot:** ask collectors to find a printing, save a target and identify a dated change. Measure task completion and returns after genuinely new data, with consent. Add a curated original-source news digest only when freshness, sourcing and ongoing maintenance are established. Multiple intraday visits need actual new events, not reshuffling prices.

## Navigation and seeding policy
Smoke checks cover route rendering, public data paths and representative exact-card/set/search/save journeys. Signed-in account workflows, checkout, delivery and external listings require separate authorized end-to-end checks. An empty account is legitimate; seed only real public catalog data or clearly labeled simulations. A rendered heading alone does not prove the feature's backend works. See RELEASE-SMOKE-2026-11-19.md for tested scope and remaining gaps.

## November 19 — image-led research and owner controls

The customer promise remains: inspect changes to exact saved cards, see target crossings and review dated evidence. Visual polish supports this promise but does not establish investment performance or daily retention.

- Named English card artwork now accompanies research sections; set tiles select artwork within that set, saved rows use the exact record, and general artwork is explicitly representative.
- Discovery selections and ranked daily mover pages rotate every two minutes while visible and not interacting, with pause/manual controls. Quote timestamps do not change on rotation; leaders can be restored immediately.
- Retain the green identity, use consistent rounded research panels, more breathing room and named image links. Rare Candy's homepage was visually reviewed: one clear hero action, spacious category navigation, large product artwork and consistent product rails. Apply these general principles with Poke Pulse's own green research identity, not copied assets or commercial claims.
- Rare Candy pricing integration is pending a documented authorized API/feed/license. Do not copy its proprietary estimated values into sold-price evidence. Public terms: https://rarecandy.com/terms . No Rare Candy data was imported.
- Existing updater already traverses every current provider group and adds unmatched English catalog identities. Comprehensive coverage is not established. Next additions require provider reconciliation, source rights, exact-printing mappings, and artwork verification; never duplicate records to increase sample counts.
- Added `/owner-agent` with server-verified UUID authorization, private report tables, pause/resume and audit controls, and a daily workflow that is inert without secrets. Activation is blocked by access to the actual backend. See OWNER-AGENT-SETUP.md. No running autonomous builder or traffic analytics is claimed.
- Next customer-value priorities: cross-device saved cards; reliable target alerts; documented sold transactions with condition/grade/shipping; dated sourced news; forecasts evaluated on unseen dates against unchanged-price and simple trend baselines.
- Measure first-save conversion, successful exact-record lookups, target usage, seven-day returning collectors, and forecast calibration/error on nonoverlapping held-out periods. Never promise daily visits, profit, prediction superiority or investor funding from a redesign.
- Artwork discovery now allows up to 160 requests per run (previously 80) with a two-minute start-request deadline and per-request timeout. Exact image validation and incremental caches remain intact. This is a capacity change, not a claim of newly recovered images.

## November 19 ranking release

The collection barometer now separates raw cards, graded asking quotes, sealed products and fixed-basket set indexes. Rank by reference value, daily gains/declines in dollars or percentage, and absolute daily movement. Search retains the overall cohort rank and ties share rank. Set levels are points, not complete-set prices, and different launch dates limit cross-set level comparisons.

Rankings use exact record identities and consecutive UTC source releases. History is checked hourly while the page is open; catalog checks every 30 minutes. These checks do not create hourly prices or history. Existing unattended provider synchronization remains unchanged. Rankings derive from valuations and must not feed back into prices as a circular premium.

Value ranks are linked from ticker cards, discovery, daily movers, exact records and the valuer. The collector ticker remains the default; an optional full priced-English-raw view includes commons. Missing artwork does not remove an otherwise valid record from rankings. Image coverage remains incomplete; never substitute incorrect card artwork to hide that gap.

Next evidence gates: authenticated cross-device saved cards, dependable consented target alerts, exact sold-price evidence with fees/condition/sample counts, and forecast comparisons against unchanged-price baselines on unseen outcomes. Measure saved-card activation and seven-day return rate before claiming improved retention. No competitive prediction advantage is established by this release.

## Private section-review standard — anniversary/glass release

Do not display this operational rubric on the public landing page. For each section, the owner auditor should record its original purpose, the concrete collector question answered, exact evidence/source date, enjoyable visual or browsing action, next useful interaction, and a measurable improvement hypothesis. Preserve financial-research boundaries, image identity and accessibility. Reject changes that invent data, exaggerate freshness or prediction confidence, or optimize clicks at the expense of evidence. Measure saved-card activation, successful exact-record lookup, repeat visits and task completion only from connected consent-aware analytics; no made-up metrics.

Current release adds a compact official Pokémon 30th-anniversary mark below Browse Sets, linked to the official celebration page; softer green glass panels, readable contrast, restrained hover depth and three collector journeys. The owner agent remains an unactivated research-auditor foundation while backend access is unavailable. This rubric is a requirement for future agent integration, not a claim of autonomous recursive building. Autonomous source changes, publication and spending remain outside the auditor's permissions.
