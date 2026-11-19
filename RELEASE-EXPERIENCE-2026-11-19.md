# Collector experience release — November 19, 2026

## Implemented

Image-led green research panels with named exact-record links; saved-card row images; same-set artwork for illustrated set-index highlights; artwork in lookup, coverage, core indexes, movers, catalog, forecasts, insights, market comparison/intelligence and era introductions. General artwork is labeled representative, not claimed as a chart constituent or forecast result.

Discovery and ranked daily mover pages rotate every two minutes. Pause controls, hidden-tab suppression, keyboard-focus and hover guards prevent disruptive replacement. Daily quote dates remain unchanged. Manual next/reshuffle and return-to-leaders controls remain available.

Artwork discovery capacity doubles to 160 requests with a two-minute request-start deadline. Catalog universe remains provider-bounded; no additional provider or manufactured data was added.

Private owner-agent route, server UUID authorization, private RLS report tables and bounded catalog-audit handler are implemented. Daily workflow is inert without its server secrets. The actual backend is not accessible through the connected Supabase account; migration/function/owner configuration and production security tests remain unperformed. This is a report agent foundation, not an activated autonomous building agent. Visitor analytics ingestion is not connected.

## Validation

87 frontend tests and 23 Node tests passed; application TypeScript check and production build passed. New tests cover fail-closed owner identity and selection pause/focus behavior. Existing saved-card tests were scoped to mover artwork after adding additional images. Browser preview loaded named artwork and existing dated observations; anonymous `/owner-agent` displayed the sign-in gate without reports. Production backend authorization/RLS tests, all-domain deployment parity, installed-PWA updates, every subpage and all external links were not reverified in this change.

Rare Candy terms were reviewed. No authorized public pricing feed was established; no Rare Candy data/assets imported. Rare Candy homepage visual inspection completed after the connected-browser timeout; its hierarchy and product rails informed the design direction.

Previous release 62580127c2588313f7ffb6fb5cad93625cd5eedf has successful Cloudflare production, frontend build, updater and CodeQL checks. This does not verify deployment of the present change.
