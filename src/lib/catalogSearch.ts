import type { CatalogEntry } from "@/hooks/useCatalog";

export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/30(?:th)?\s+(?:anniversary|celebration)/g, "30th celebration")
    .replace(/[^a-z0-9]+/g, " ").replace(/\b0+(\d)/g, "$1").trim();
}
export function matchesCatalogQuery(text: string, query: string): boolean {
  const words = normalizeSearch(text).split(/\s+/);
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return terms.every(term => words.some(word => word === term || (term === "promo" && (word === "promos" || word === "promotional")) || (term.length >= 4 && word.startsWith(term))));
}
export function catalogSearchText(e: CatalogEntry): string {
  return [e.name, e.set, e.setId, e.number, e.variant, e.grade, e.kind].filter(Boolean).join(" ");
}

export function matchesExactSetRequest(set: string, query: string): boolean {
  const normalized = normalizeSearch(query);
  if (!/\bbase set\b/.test(normalized) || /\bbase set 2\b/.test(normalized)) return true;
  return /^base set(?: shadowless| first edition| 1st edition)?$/.test(normalizeSearch(set));
}
