# Rayquaza and rotating quote evidence

PR 22 merged after all GitHub checks passed (83790845cf98406bd6a24278456a0e79347df24d). This follow-up replaces the wordmark with the official English Rayquaza expansion illustration, darkens the emerald surfaces, and displays each banner card's own USD quote, variant and source date as the card rotates. Missing quotes are not converted to displayed zero prices. Catalog refresh remains every 30 minutes; updated provider releases are adopted when available. An animation is not a new market observation.

Official image source (downloaded and visually verified): https://mcdn.pokemon.com/image/upload/c_limit,w_1439/f_auto/q_auto:best/v1/live/pcom-cms/static-assets/cms3/us/img/trading-card-game/tiles/me/me06/announce/me06-announce-169-en.png
Local asset: public/images/delta-reign-rayquaza.jpg (JPEG supplied by the official image endpoint).

Validation: 97 frontend tests and TypeScript pass. Includes exact-card price/date association before and after rotation and preservation of saved quotes when artwork fails. Production build and deployment results are reported separately; this document does not claim every domain or backend feature is live.

This change applies to shared section artwork banners. Set-specific banners retain exact set scope, and missing eligible images remain disclosed. Core charts, saved collections and ranking results are not randomly replaced with unrelated data.
