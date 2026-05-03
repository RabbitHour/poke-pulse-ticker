---
name: Boardroom & Swarm
description: Owner-only /boardroom org chart + multi-agent swarm dispatcher; Civilian (Unicorn AI Builder) vs Federal (Empire Defense, Delta Pod) split
type: feature
---
- Route: `/boardroom` — gated by `OwnerOnlyGate` (email = pokegarageva@gmail.com). noindex,nofollow.
- Org tree rendered top-down: Dave → AI Unicorn → {Civilian: Unicorn AI Builder (corps, brands, Personal Pod, Poke-Pulse) | Federal: Empire Defense, Delta Pod (TOP SECRET)}.
- Federal/Empire/Delta Pod material is owner-only; eventual spinout into standalone project planned.
- Swarm = many specialist agents in parallel on one mission. Edge fn `swarm-dispatch` calls Lovable AI gateway with presets: civilian, federal (owner-only enforced server-side via JWT), pokepulse, moat.
- Moats listed: Data, IP, Brand, Distribution, Tech, Legal, Compliance.
- Always wrap new sensitive surfaces in OwnerOnlyGate + meta noindex.
