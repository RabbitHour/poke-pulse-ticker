const stopWords = new Set(["what", "whats", "is", "the", "price", "of", "show", "me", "find", "cards", "card", "pokemon", "worth", "tell", "about", "value", "cost", "please"]);
function words(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/['’]/g, "").match(/[a-z0-9]+/g) ?? [];
}

export function matchesValueQuery(query: string, name: string, set: string, detail = "") {
  const tokens = words(query).filter(word => !stopWords.has(word));
  const baseSet = /\bbase set\b(?!\s*2\b)/i.test(query);
  if (baseSet && !/^base set(?:\s*[-–:]\s*(?:shadowless|1st edition))?$/i.test(set.trim())) return false;
  const record = new Set(words([name, set, detail].join(" ")));
  return (tokens.length > 0 || !query.trim()) && tokens.every(word => word === "promo" || word === "promos"
    ? record.has("promo") || record.has("promos") || record.has("promotional")
    : record.has(word));
}
