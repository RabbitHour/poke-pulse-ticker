export function checkoutPolicy(secret: string, priceId: unknown, prices: string, origin: string | null, origins: string) {
  if (!/^(sk|rk)_test_/.test(secret)) throw new Error("Checkout requires Stripe sandbox configuration.");
  const allowedPrices = prices.split(",").map(s=>s.trim()).filter(Boolean);
  const allowedOrigins = origins.split(",").map(s=>s.trim()).filter(Boolean);
  if (typeof priceId!=="string" || !allowedPrices.includes(priceId)) throw new Error("This sandbox price is not enabled.");
  if (!origin || !allowedOrigins.includes(origin)) throw new Error("This checkout origin is not enabled.");
  const parsed=new URL(origin);
  if (parsed.origin!==origin || (parsed.protocol!=="https:" && !(parsed.protocol==="http:" && ["localhost","127.0.0.1"].includes(parsed.hostname)))) throw new Error("Invalid checkout origin.");
  return {priceId,origin};
}
