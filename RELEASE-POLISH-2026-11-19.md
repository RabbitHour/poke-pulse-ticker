# Anniversary and collector-interface polish

Based on main 16cdd543cb69cf29ab974485e4bdfbc5688155c5 (PR17), whose Cloudflare build, GitHub build and CodeQL checks succeeded. New changes are additive: compact official anniversary mark directly beneath Browse Sets; warm neutral gold badge alongside the existing green brand; softly translucent panel surfaces, consistent rounding, card hover depth, keyboard focus treatment and responsive browse/research/saved-card shortcuts. Reduced-motion users do not receive the new hover motion. No valuation, prediction, quote date or ranking calculations changed.

Artwork: original unmodified SVG from https://30.pokemon.com/favicons/favicon.svg; linked official destination https://30.pokemon.com/en-us. Pokémon artwork belongs to its respective owners; existing non-affiliation notice retained. The local asset avoids an extra third-party image request during page load.

Validation: 93 frontend tests and TypeScript pass. Production build result and browser checks recorded in the release response. SITE-URL-DIRECTORY.md lists all static WWW routes and core landing anchors; backend-dependent and dynamic pages are not asserted operational merely because their routes exist.

Owner-agent database probe still returns inaccessible. No owner-agent activation, autonomous build loop, analytics integration or backend security deployment is claimed. COLLECTOR-VALUE-PLAN.md holds the private per-section value rubric.

Git work is isolated in a new worktree based on fetched main. Existing local edits/data remain untouched and are excluded from this release. David's Windows checkout cannot be inspected from this workspace: run git status --short before git pull --ff-only; preserve any local changes. No force push or destructive reset is needed.
