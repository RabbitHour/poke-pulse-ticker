# Customer readiness — November 19, 2026

This is a bounded audit, not certification of every route or a penetration test.
Source baseline: a490b2f2fb71460afa83f5cd66f6ede2e5ee5f67.

## Confirmed in the connected Edge browser
- WWW homepage displays the anniversary mark and polished release.
- /account renders free signup, sign-in, confirmation resend and recovery controls. No account was created, no terms accepted, and no email was sent during this audit.
- /memberships renders optional plans with checkout and paid research disabled. No payment was taken.
- /owner-agent requires sign-in and exposes no owner report while signed out.
- /sets renders 252 artwork-covered set groups in the observed release; searching Base Set filters the list. Duplicate provider set aliases remain visible (e.g. Aquapolis). These are not 252 independently reconciled sets.
- /catalog/tcg%3A88866%3A1st%20Edition%20Holofoil loads Sabrina's Alakazam, exact variant, $327.28 reference quote dated 2026-11-18, rank, source/marketplace links and timeline. Sample size is explicitly unavailable. Artwork states exact detail not yet checked.
- Apex navigation could not be completed in this audit because the browser request timed out. The earlier Cloudflare Access restriction is not proven resolved.
- Lovable parity, installed-PWA parity, every dynamic detail URL, every outbound destination, full accessibility and all signed-in flows were not verified.

## Backend and automation evidence
A fresh Lovable SELECT now() request returned 400 query_error, database possibly inaccessible. This is a blocker to verification, not proof that every authentication request fails.
The last 20 GitHub runs include successful market-updater and verification runs; no owner-audit run appeared in that limited sample. Absence in that sample does not establish that no historical run exists.
Market updater source schedules checks at minutes 7 and 37. The visible quote release remains daily. A successful check must not be presented as a new price observation.
Owner-agent source schedules a daily audit and skips when credentials are missing. It is a research auditor, not an autonomous builder. Active scheduling and private report persistence remain unverified.
An hourly private ChatGPT status task was attempted but rejected because five active tasks already fill the plan limit. Existing tasks were left unchanged.

## Email findings and repair
The existing job is weekly portfolio email, not a daily market snapshot. It previously lacked a handler-level scheduler check and labeled the first portfolio card as a top mover with a hard-coded percentage.
This patch requires POST plus POKE_EMAIL_SCHEDULE_SECRET in x-poke-email-schedule before database access, requires confirmed user email, disables the legacy job unless explicitly enabled, and omits the unsupported mover claim. Existing platform JWT verification remains unchanged.
Do not enable POKE_WEEKLY_EMAIL_ENABLED until snapshot dating, missing-data handling, consent and end-to-end delivery are reviewed. The legacy latest/eighth-snapshot comparison is not a guaranteed seven-day comparison.
These source changes are not deployed Supabase functions. A frontend deployment alone does not apply them.

## Daily free market email release requirements
Default requested delivery: 06:00 America/New_York, honoring daylight-saving changes. It is independent of a paid subscription.
1. Restore the configured backend; verify sender domain and email delivery provider.
2. Add an explicit signup preference describing the free daily email, store preference revision/time, and require confirmed email. Permit immediate unsubscribe without requiring login; honor suppression and bounce lists.
3. Build the digest from validated dated market releases: source date, exact movers, set-index changes, coverage/sample limitations, and links. Say when there is no newer release; never fill missing prices with zero.
4. Persist a unique delivery key per user and local date. Claim jobs atomically, keep provider idempotency keys, retry boundedly, reconcile ambiguous outcomes, and record delivery/bounce outcomes rather than treating enqueue as delivered.
5. Run a DST-aware scheduler and record last successful run/queue age privately. Test duplicate runs, retries, unsubscribes, stale data, sender failures and both DST seasons.
6. Test with a designated owner-controlled test mailbox, then verify signup → confirmation → digest preference → delivery → unsubscribe → no further send. No customer mailing was activated by this audit.
7. Only then advertise the daily email as available. Keep upgrade optional and free access independent.

## Remaining full customer acceptance checks
Account confirmation, sign-in/out, recovery, cross-domain redirect allowlist, account deletion; save/edit/remove and account synchronization; payment test-mode checkout, webhook idempotency, cancellation and entitlement expiry; rankings filters and pagination; source freshness and partial coverage; mobile keyboard/focus/contrast; full signed-in route matrix; owner/non-owner authorization; rate limits, secrets, dependencies and restoration testing. Current local saved cards do not imply account synchronization.

## Validation
93 frontend tests; 28 Node script tests including four new request-handler authorization tests; TypeScript check; production build passed. Build warns about chunk size. Static internal-route registration checks pass; that does not prove each destination's backend functionality.
