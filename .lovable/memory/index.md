# Memory: index.md
Updated: today

# Project Memory

## Core
- **Branding:** Use 'Poké' (never 'Pokémon'). Primary green `hsl(158, 72%, 46%)`. Hide 'Edit with Lovable' badge.
- **Security:** Zero-trust RLS. Use SECURITY DEFINER RPCs for wallet/age changes. Block right-click/dev tools, hijack clipboard.
- **Pricing Logic:** `getBestPrice` blends TCGPlayer market × Card Ladder (×1.15) × PriceCharting (×1.04) × live boost (×1.08). 5-source consensus: TCGPlayer 35 / eBay 25 / Card Ladder 20 / PriceCharting 12 / Cardmarket 8. Daily change dampened 0.3x and clamped ±8%.
- **Card Pool:** Fetch 1500 cards (4 holofoil pages + 2 normal + 1 reverse + 2 rarity). Refresh every 30 min.
- **Performance:** Use `react-window` for lists, `useReducedMotion` for mobile INP. sw.js: network-first dynamic, cache-first static.
- **Affiliate:** Inline AffiliateLinks (compact) on every TopMover row + every TrendingCards tile for site-wide buy intent.
- **Assets:** Fallback missing card images to `/icon-192.png`. PWA icons <50KB.
- **UI Constraints:** Base font 16px. Footer `text-[5px]` with `py-px`. No exit-intent or fomo popups on the landing page.
- **Landing order:** Hero → SocialProof → Wallet → CertifiedDataPartner → eBayLiveDeals (moved up) → MarketPulse+Sales → Indexes.
- **Federal/Empire/Delta Pod = TOP SECRET, owner-only (pokegarageva@gmail.com).** Always wrap with `OwnerOnlyGate` + `noindex,nofollow`. Federal swarm preset enforced server-side.

## Memories
- [Boardroom & Swarm](mem://features/boardroom-and-swarm) — /boardroom org chart + multi-agent swarm-dispatch edge fn
- [Stripe Payments](mem://integrations/stripe-payments) — 7-tier subs, 5k starting PC bank, checkout edge functions
- [Backend Infra](mem://architecture/backend-infrastructure) — Supabase edge functions, multi-region database replica
- [Portfolio Tracking](mem://features/portfolio-tracking) — CSV import, daily snapshots, tracking analytics
- [API Security](mem://architecture/api-security) — SECURITY DEFINER RPCs, strict RLS for state changes
- [Mobile PWA](mem://architecture/mobile-pwa) — sw.js logic, manifest configuration, offline support
- [Content Protection](mem://architecture/content-protection) — DRM, right-click blocking, clipboard hijack, SVGs
- [Ticker Symbols](mem://features/ticker-symbols) — Deterministic codes (CHAR-BS4), graded suffixes (·P10)
- [Email Notifications](mem://integrations/email-notifications) — notify.poke-pulse-ticker.com, weekly audits
- [Subscription Gating](mem://features/subscription-gating) — Two-stage auth/sub gating system
- [Portfolio Alerts](mem://features/portfolio-alerts) — ±3% to ±15% threshold edge function via pg_cron
- [Tier Promotion](mem://features/pricing/tier-promotion) — UI cues, $4.99 Pro tier is MOST POPULAR
- [Methodology](mem://features/methodology-transparency) — RAW/GRADED/SEALED 1000 index logic; 5-source weighting incl PriceCharting
- [Price Alerts](mem://features/price-alerts) — Whale tier MA30 predictive Delta Alerts
- [Deployment Settings](mem://branding/deployment-settings) — Hidden Lovable badge on production
- [Institutional Tools](mem://features/institutional-tier-tools) — FIFO Capital Gains, Grade Spreads, WebAuthn
- [Automated Summaries](mem://features/retention/automated-summaries) — Monday 6AM EST emails
- [ElevenLabs](mem://integrations/elevenlabs-audio) — TTS and Music scopes for AI audio
- [Social Promos](mem://marketing/social-promotional-assets) — n8n rotation, ffmpeg sidechain compression
- [SEO Metadata](mem://marketing/seo-and-social-metadata) — JSON-LD, canonical tags, LinkedInBot
- [Index Charts](mem://features/market-index-charts) — Intraday charts, Market Closed countdown
- [Investor Demo](mem://features/investor-demo-system) — demo@poke-pulse-ticker.com permanent Team tier
- [Engagement Loop](mem://features/engagement-loop) — 3 picks/day prediction game in localStorage
- [Domain Config](mem://architecture/domain-configuration) — DNS records and Lovable redirection
- [Accessibility](mem://accessibility/high-visibility-system) — contrast(1.05) saturate(1.08) card filters
- [Arena](mem://features/poke-pulse-arena) — 1v1 duels, Twilio video chat lobby
- [Affiliate Tracking](mem://features/affiliate-tracking) — CPC rates, keepalive REST calls
- [Twilio Video](mem://integrations/twilio-video) — Manual JWT edge function, 18+ verification
- [Branding Identity](mem://style/branding-identity) — hsl(158, 72%, 46%) green, Poke naming
- [Video Promos](mem://marketing/video-assets/promotional-suite) — Remotion rootScale 1.15
- [SimTrader Ecosystem](mem://features/simulated-trading-ecosystem) — $100k start, AI bots, limit orders
- [Compliance](mem://legal/compliance) — Obfuscation mode, ToS anti-scraping
- [Dead Mans Switch](mem://features/dead-mans-switch) — `dead-mans-switch` edge fn alerts dev if index_cache stale >10min
