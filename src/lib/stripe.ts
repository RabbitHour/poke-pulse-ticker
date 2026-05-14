// Stripe product/price mapping — 7 tiers for maximum conversion
// Free ($0) → Arena ($0.99) → Starter ($2.99) → Pro ($7.99) → Premium ($14.99) → Team ($29.99) → Whale ($99.99)
// v3 prices (raised 2026-05). Existing subs grandfathered on old prices via Stripe (price IDs are immutable).
export const STRIPE_TIERS = {
  arena: {
    product_id: "prod_UFeyXfI3gOan3o",
    price_id: "price_1TH9eLPRXT5iryzGltaBaKJ9",
    name: "ARENA",
    price: "$0.99",
    period: "/month",
    annual: {
      product_id: "prod_UFeyXfI3gOan3o",
      price_id: "price_1TH9eLPRXT5iryzGltaBaKJ9",
      price: "$0.99",
      period: "/month",
      savings: "",
    },
  },
  starter: {
    product_id: "prod_UFnurafBZwXWY4",
    price_id: "price_1TWssVPRXT5iryzGvxLBPlJ5",
    name: "STARTER",
    price: "$2.99",
    period: "/month",
    annual: {
      product_id: "prod_UFnvsSe0zB6EAD",
      price_id: "price_1TWssuPRXT5iryzGayigvV47",
      price: "$29.90",
      period: "/year",
      savings: "Save $5.98",
    },
  },
  pro: {
    product_id: "prod_UFnw73TGPp6Ec3",
    price_id: "price_1TWstRPRXT5iryzGH85yOEPt",
    name: "PRO",
    price: "$7.99",
    period: "/month",
    annual: {
      product_id: "prod_UFnw30XbsD15vP",
      price_id: "price_1TWstnPRXT5iryzG5kUnOtVd",
      price: "$79.90",
      period: "/year",
      savings: "Save $15.98",
    },
  },
  premium: {
    product_id: "prod_UFnwATMOXq8b6B",
    price_id: "price_1TWsuAPRXT5iryzGEK3acuB6",
    name: "PREMIUM",
    price: "$14.99",
    period: "/month",
    annual: {
      product_id: "prod_UFnxyuQ8fGNYWc",
      price_id: "price_1TWsucPRXT5iryzGvqPgDA8J",
      price: "$149.90",
      period: "/year",
      savings: "Save $29.98",
    },
  },
  team: {
    product_id: "prod_UFnyviY7wZBvQQ",
    price_id: "price_1TWsuxPRXT5iryzGkgzt6rJ7",
    name: "TEAM",
    price: "$29.99",
    period: "/month",
    seats: 3,
    annual: {
      product_id: "prod_UFny79PBQg6d7F",
      price_id: "price_1TWsvJPRXT5iryzGP350EAcT",
      price: "$299.90",
      period: "/year",
      savings: "Save $59.98",
    },
  },
  whale: {
    product_id: "prod_UFnyxhOFHIQO5k",
    price_id: "price_1TWsvfPRXT5iryzGSX0BMTkv",
    name: "WHALE",
    price: "$99.99",
    period: "/month",
    seats: 5,
    annual: {
      product_id: "prod_UFnzWxAELA55Fs",
      price_id: "price_1TWswHPRXT5iryzGfDnSbEtr",
      price: "$999.90",
      period: "/year",
      savings: "Save $199.98",
    },
  },
} as const;

// Legacy product IDs for existing subscribers — map to new tier names
const LEGACY_PRODUCT_MAP: Record<string, TierKey> = {
  // Old Starter $4.99/mo → now Starter
  "prod_UFbILYIMFAhdbd": "starter",
  "prod_UFbIN8K7i1sjCg": "starter",
  // Old Pro $9/mo → now Pro
  "prod_UFLCtrgrLTQwAK": "pro",
  "prod_UF3Knh8WvKsjHJ": "pro",
  "prod_UF4CTA2M0ETK0a": "pro",
  "prod_UFLChD4HzflIqE": "pro",
  // Old Premium $39/mo → now Premium
  "prod_UFLDpPeSbjJBbQ": "premium",
  "prod_UFLD0mCfO3ckXM": "premium",
  // Old Institutional $99/mo → now Premium
  "prod_UF3QB0Bneb91tt": "premium",
  "prod_UF4C2aEY1dOB0J": "premium",
  // Old Trader $99/mo → now Premium
  "prod_UFFxtUeqMcBaWL": "premium",
  "prod_UFFxn9sXi6ag1V": "premium",
  // Old Team $99-149/mo → now Team
  "prod_UFLEYH02tl3Kso": "team",
  "prod_UFLFdTLL0Xk2qG": "team",
  "prod_UFL2cezPipeaUs": "team",
  "prod_UFL2LEJfzon17Q": "team",
};

export type TierKey = keyof typeof STRIPE_TIERS;

export const getTierByProductId = (productId: string): TierKey | null => {
  // Check current products
  for (const [key, tier] of Object.entries(STRIPE_TIERS)) {
    if (tier.product_id === productId || tier.annual.product_id === productId) return key as TierKey;
  }
  // Check legacy products
  return LEGACY_PRODUCT_MAP[productId] || null;
};
