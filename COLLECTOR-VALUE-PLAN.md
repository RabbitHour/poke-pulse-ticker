# Poke Pulse: collector value and daily return plan
Updated November 18, 2026. Applies to pokepulseticker.com, www.pokepulseticker.com, configured alternate domains, and the installable web app.

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
