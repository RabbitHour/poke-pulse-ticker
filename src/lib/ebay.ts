// eBay affiliate link builder — Poke-Pulse campaign
export const EBAY_CAMPAIGN_ID = "5339151162"; // poke-pulse campaign
export const EBAY_PUB_ID = "5575378759";
export const EBAY_CUSTOM_TAG = "poke-pulse-ticker";

/**
 * Build an eBay Partner Network rover affiliate link wrapping a search query.
 * Tracks revenue back to the poke-pulse campaign.
 */
export function ebayAffiliateLink(query: string, customId = EBAY_CUSTOM_TAG): string {
  const search = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
  const r = new URL("https://rover.ebay.com/rover/1/711-53200-19255-0/1");
  r.searchParams.set("icep_ff3", "9");
  r.searchParams.set("pub", EBAY_PUB_ID);
  r.searchParams.set("toolid", "10001");
  r.searchParams.set("campid", EBAY_CAMPAIGN_ID);
  r.searchParams.set("customid", customId);
  r.searchParams.set("mpre", search);
  return r.toString();
}

/**
 * eBay Browse API condition IDs we use:
 *  1000 = New, 3000 = Used, 2750 = Like New, 4000 = Very Good
 *  For graded slabs we filter by category + keyword instead.
 */
export const EBAY_CONDITIONS = {
  NEW: "1000",
  USED: "3000",
  LIKE_NEW: "2750",
} as const;
