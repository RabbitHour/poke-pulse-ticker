# Private Poke Agent activation

Implemented route: `/owner-agent`. It uses existing account sign-in/sign-out, but the server must authorize the exact verified Auth UUID using `POKE_OWNER_USER_ID`. A display name, email typed into a form, or ordinary public account never grants access.

Not activated as of November 19, 2026. The connected Supabase account exposes a different inactive project, not this site's configured project `eikhrxplszgnmgzsktdl`. No production migration, owner assignment or schedule credential was applied.

Activation requires administrator access to the site's actual backend:

1. Confirm David's existing verified Auth user UUID privately. Configure `POKE_OWNER_USER_ID` as a server secret. Never put service credentials in VITE variables or Git.
2. Apply the new `poke_owner_agent` migration through the existing migration process. Tables have RLS enabled, no client policies, and no anon/authenticated grants. Only the authenticated server handler accesses reports.
3. Deploy `poke-owner-agent`. Its scheduler uses a separate high-entropy `POKE_AGENT_SCHEDULE_SECRET`; configure the function gateway to permit the handler to verify credentials (verify_jwt=false for this function only). The handler independently verifies user JWTs with Auth and matches the owner UUID; the scheduler credential can only run reports.
4. Set GitHub Actions secrets `POKE_AGENT_URL` and `POKE_AGENT_SCHEDULE_SECRET`. The daily workflow runs at 13:20 UTC. Secrets and report contents are never printed. No credential means no request.
5. Verify missing token -> 401, non-owner -> 403, absent owner configuration -> 503, authenticated owner -> status. Verify direct REST reads/writes fail for anon and ordinary users. Test sign-out, pause, resume and manual audit. Start paused; David resumes after verification.

The first agent is a bounded research auditor: it checks the published catalog date/counts and saves recommendations. It does not alter source, merge, deploy, contact customers or spend money. It is not yet an autonomous building agent. Next phase: private analytics ingestion, consent-aware conversion/retention metrics, issue proposals with evidence, isolated patches, tests and David approval before release. Do not give a model unrestricted service-role or GitHub write credentials.

Visitor analytics are explicitly unconnected. Add a validated analytics adapter before showing traffic, conversion or retention claims. Report conclusions must be tied to measured data, not generated estimates.

## Ranking release security follow-up

The footer now links to owner sign-in. The owner page has no signup action; the legacy `/command-center` route uses the same owner gate. Existing account authentication is reused. No password has been generated or retrieved, and the active owner account still requires backend verification.

After the original owner-agent migration, apply `20261119152008_owner_audit_hardening.sql`. It adds an atomic five-minute report cooldown and removes public/anon/authenticated direct grants on legacy site-audit tables. Deploy the updated `poke-owner-agent`, `site-audit`, and `ai-sales-agent` functions. Manual legacy audit and sales-agent access now requires the verified owner UUID, not merely a signed-in user or matching email. Existing sales scheduler service authentication is preserved. Do not invoke outreach while testing permissions.

The report scheduler cannot read report history, pause/resume, or receive private report contents. Responses are no-store; malformed/oversize owner requests and unsupported methods are rejected. Test these controls against the actual backend before enabling scheduling. Source regression tests are not a penetration test or production RLS verification.

Backend activation remains blocked by database access. Hosting WAF/rate limits, owner MFA, Auth redirect allowlists, backups, credential rotation, live RLS checks and monitoring require administrator verification in the configured backend/hosting accounts. No claim of complete security or zero vulnerabilities is made.
