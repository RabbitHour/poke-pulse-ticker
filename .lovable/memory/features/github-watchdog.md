---
name: GitHub Sync Watchdog
description: Edge function `github-watchdog` runs every 5min via pg_cron, probes GitHub repo commits API, asks Claude (Opus→Sonnet→GPT-5→Gemini fallback) to diagnose, and emails contact@poke-pulse-ticker.com via Brevo if API unreachable or no commits in >2h.
type: feature
---
- File: `supabase/functions/github-watchdog/index.ts`
- Schedule: every 5 min via pg_cron job `github-watchdog-every-5-min`
- Repo: defaults to `poke-pulse-ticker/poke-pulse-ticker`, overridable via `GITHUB_REPO` env
- Optional: `GITHUB_TOKEN` secret for private repo / higher rate limit
- Alert triggers: API not reachable OR last commit age > 2h (Lovable sync broken)
- Cache key: `index_cache.github_watchdog` (15-min TTL) — UI can surface status
- Model chain: claude-opus-4 → claude-3-5-sonnet → gpt-5 → gemini-2.5-pro → gemini-3-flash
- Sender: noreply@notify.poke-pulse-ticker.com (Brevo)
