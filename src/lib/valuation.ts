export function totalQuote(price: number, quantity: number): number | null {
  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) return null;
  return Math.round(price * quantity * 100) / 100;
}
