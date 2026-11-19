# Ranking release — November 19, 2026

Implemented: separate raw, graded asking-quote, sealed and set-index rankings; value, gains/declines in dollars/points and percentage, absolute movement; stable competition ties and exact record evidence links. Source dates remain explicit. Hourly history polling is a check while open, not hourly price generation. Catalog refresh remains every 30 minutes. No expanded provider access or intraday price feed is claimed.

Homepage has illustrated ranking highlights, centered image panels, value-rank links across discovery/daily/ticker/valuer/detail views and a footer Owner login. Full rankings retain priced records without artwork; the optional artwork filter preserves overall ranks. Collector ticker remains default, with an optional all-priced English raw-card view. Ticker selects representative printings per card name, rather than showing every printing simultaneously.

Security source changes: owner UUID authorization for legacy site-audit/manual sales functions, owner-gated command-center route, private no-store reports, bounded requests and an atomic five-minute audit cooldown, plus migration revoking direct client grants on legacy audit tables. Scheduler can run only and cannot receive private report contents. These function/migration changes still require backend deployment and live authorization/RLS verification. They do not establish that production is fully secured.

Validation: 93 frontend tests pass; 24 Node script/security regression tests pass. Source-date archive test covers next-day archival. TypeScript passes. Production build passes (large existing bundle warning). npm audit after scoped compatible updates: 0 high, 0 critical, 13 moderate advisories across the full dependency tree; unresolved moderate advisories remain. Bun and npm locks synchronized, Radix primitive pin retained. No generated market data or secrets committed.

Browser checks: /rankings renders 41,768 priced raw records; daily gain selection renders 6,038 eligible raw gains, 247 sealed gains and 111 set gains from source 2026-11-18T20:05:56+0000. Graded coverage is unavailable in this preview and remains explicitly empty. These counts describe this source release, not all Pokémon products. Owner signed-out page displays email/password login and password recovery without signup; footer links /owner-agent. All-raw ticker renders rank links and 3,503 representative indexed names. Full all-route, installed-PWA and production-domain parity remain unverified. Artwork is incomplete.

Backend activation remains blocked: configured Supabase project eikhrxplszgnmgzsktdl is not accessible through the connected backend account; Lovable database query reported inaccessible. No owner account/password, migration, function deployment, WAF setting or MFA setting was created or verified. OWNER-AGENT-SETUP.md provides the required activation sequence. No outreach or audit-email actions were invoked.

## Optional local PyCharm refresh after merge

Run each command separately in PowerShell and press Enter:

```powershell
Set-Location "C:\Users\noyes\PycharmProjects\Poke-Pulse-Ticker-GitHub"
git status --short
git remote -v
```

If changes are listed, preserve them and review before pulling; do not reset. Confirm origin is RabbitHour/poke-pulse-ticker. With a clean checkout:

```powershell
git switch main
git pull --ff-only origin main
node --version
npm ci
npm test
npm run build
npm run dev
```

Use the repository's Node 24 build baseline. Open the local URL printed by Vite. GitHub-connected hosting deploys independently of these laptop commands. Do not paste credentials into chat or commit environment files. Backend activation cannot be solved by rerunning npm.
