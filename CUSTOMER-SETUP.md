# Customer and domain setup

The interrupted local Git merge was resolved without losing content: the conflicts were identical after normalizing line endings. Do not reset or force-push.

## Cloudflare and pokepulseticker.com

The token previously pasted into chat must stay revoked. Keep the replacement only in GitHub Actions secrets. The account ID is not a token.

You need **Secrets and variables → Actions**, not **Deploy keys**:
https://github.com/RabbitHour/poke-pulse-ticker/settings/secrets/actions

Add repository secrets `CLOUDFLARE_API_TOKEN` (replacement token with account-scoped Cloudflare Pages Edit permission) and `CLOUDFLARE_ACCOUNT_ID` (your account ID). Under Variables add `CLOUDFLARE_PROJECT` = `poke-pulse-market`, unless you already created another Pages project. Use that exact actual project name.

The updater now creates the named Pages project if it does not exist, then uploads the verified build. Run the **Unattended market updater** from Actions on **main** after saving settings. It cannot deploy until these settings are present. Only the returned deployment URL proves success.

After the `.pages.dev` site works:

1. In Cloudflare, open **Workers & Pages → poke-pulse-market → Custom domains → Set up a custom domain**.
2. Enter **pokepulseticker.com**, select your existing Cloudflare zone, and review Cloudflare's proposed DNS change. Activate the domain once the target is the correct Pages project. Do not overwrite existing email MX/TXT records.
3. Optionally repeat for **www.pokepulseticker.com**. Wait until the domain and certificate show Active. Never bypass a browser certificate warning.
4. In your authentication provider's URL configuration, set the production site URL to **https://pokepulseticker.com**. Allow **https://pokepulseticker.com/account**, the corresponding www URL if used, and local development `/account` URLs only while needed.
5. Verify the exact apex URL, `/account`, `/memberships` and an exact `/catalog/…` page by opening them directly. Existing `.lovable.app` deployment is separate and has not been republished by this change.

## Free account email delivery

The public auth settings endpoint is reachable; email signup is enabled and email confirmation is required. That does **not** prove delivery works. The updated form now distinguishes network failures, incorrect credentials, confirmation required, email recipient restrictions and email rate limits, and offers a resend button.

Use your own address in the new `/account` page and report the displayed error, without sending passwords. Keep email confirmation enabled. Supabase's built-in mail service is for testing and restricts recipients and sending volume. Configure a production SMTP sender or Send Email hook in Supabase Authentication settings (or the corresponding Lovable-managed backend settings). Verify your sender domain with the actual email provider's DNS records. Do not invent SPF, DKIM or MX values. Preserve existing mail records.

Test new signup → received confirmation → signed-in account → sign out → sign in → password recovery. A successful mocked test does not replace this real email test.

## Optional memberships and payment service

Prepared prices: Extended Poke **$2.99/month**, Predictor workspace **$4.99/month**, collection CSV reports **$2.99/month**. These are monthly subscriptions, not one-time purchases. Checkout defaults OFF.

Deploy the `customer-service` and `collection-report` edge functions to the existing backend, and apply `20261103180000_customer_research.sql`. The SQL restricts saved research to its account owner and keeps quota writes server-only. Saved sessions are accessible for 30 days. Schedule a daily purge of expired rows and old usage rows if physical deletion after retention is required.

Configure the following via the backend secret manager, never frontend code:

- Existing `STRIPE_SECRET_KEY`, first using Stripe test mode.
- `POKE_PRICE_ID`: the matching USD 299-cent monthly recurring test price.
- `PREDICTOR_PRICE_ID`: the matching USD 499-cent monthly recurring test price.
- `REPORTS_PRICE_ID`: the matching USD 299-cent monthly recurring test price.
- `PUBLIC_SITE_URL=https://pokepulseticker.com`.
- `CUSTOMER_ALLOWED_ORIGINS=https://pokepulseticker.com` (add the actual test site origin when testing).
- Reports origin/catalog variables from PUBLIC-LAUNCH.md.

In test mode only, enable `CUSTOMER_PLANS_ENABLED=true` and `REPORTS_ENABLED=true` in the backend; enable the corresponding frontend `VITE_CUSTOMER_PLANS_ENABLED` and `VITE_REPORTS_ENABLED` build flags for the test deployment. Configure Stripe's customer portal. Verify subscription, cancellation, duplicate-subscription rejection, session ownership, expired access, free-account refusal, quotas, export and billing portal ownership. Predictor checkout deliberately refuses to sell access before real dated forecasts exist.

Only after these tests should live Stripe prices/credentials and production frontend flags be enabled. Backend access is checked against Stripe for each paid request; a client flag never grants paid access. Poke extended sessions are source-based catalog research with saved history, not an unlimited general AI or a complete copy of the internet. Predictor membership offers a saved workspace, not exclusive ownership of the public forecast data or guaranteed accuracy.

The paid backend and migration have not been deployed by the source update alone. Real checkout and confirmation email delivery are not yet verified.

## eBay referrals

Original eBay campaign settings were recovered from `src/lib/ebay.ts`. Featured physical-card and catalog-image links now open exact-query affiliate searches, with a separate internal details/history link and disclosure. Pocket digital collectibles do not link to supposed cash listings. Confirm the recovered campaign is still active in your eBay Partner Network account. Link parameters alone cannot prove attribution or payouts; verify using EPN reporting after legitimate traffic. Do not make a self-purchase to test commission.

## Promotion

Do not post the launch yet. First finish domain/certificate, real account confirmation/recovery, Stripe test-mode checks, backend ownership checks and visual mobile/desktop verification. Reddit and community promotion remains pending; review each community's current self-promotion rules and prepare a clearly disclosed post before publishing it.

## Local terminal

After the source changes are committed, these commands update the existing branch safely:

```powershell
Set-Location 'C:\Users\noyes\PycharmProjects\Poke-Pulse-Ticker-GitHub'
git status --short
git fetch origin
git merge --no-edit origin/main
npm test
node --test scripts/record-history.test.mjs scripts/service-worker.test.mjs
npm run build
```

If any command fails, resolve its error before continuing. Do not run `git add .` while generated `public/data/` files are untracked; the unattended updater stores those separately in `market-data`.
