/**
 * Global feature-gate switch.
 *
 * When `GATES_ENABLED` is false, every subscription/tier gate on the site is
 * bypassed and all features render unlocked for everyone (no blur, no upsell
 * overlay). Flip back to `true` to re-enable paid tier gating.
 *
 * Note: this does NOT affect the owner-only gate or the age verification gate,
 * which stay enforced for legal/security reasons.
 */
export const GATES_ENABLED = false;
