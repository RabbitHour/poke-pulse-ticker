import { describe, it, expect } from "vitest";
import { matchesCatalogQuery } from "./catalogSearch";
describe("collector search", () => {
  it("recognizes the 30th Anniversary alias across separate fields", () => {
    expect(matchesCatalogQuery("Mew ex ME: 30th Celebration 158/128 Holofoil", "Mew 30th Anniversary")).toBe(true);
  });
  it("accepts reordered terms, punctuation, accents and padded numbers", () => {
    expect(matchesCatalogQuery("Mew ME: 30th Celebration 065/128", "30th anniversary Mew #65")).toBe(true);
    expect(matchesCatalogQuery("Flabébé Scarlet & Violet", "flabebe violet")).toBe(true);
  });
  it("does not substitute Mewtwo or a different anniversary set", () => {
    expect(matchesCatalogQuery("Mewtwo 30th Celebration", "Mew 30th Anniversary")).toBe(false);
    expect(matchesCatalogQuery("Mew Celebrations", "Mew 30th Anniversary")).toBe(false);
  });
  it("supports empty queries and keeps exact numbers distinct", () => {
    expect(matchesCatalogQuery("Pikachu 025/102", "")).toBe(true);
    expect(matchesCatalogQuery("Pikachu 025/102", "25")).toBe(true);
    expect(matchesCatalogQuery("Pikachu 125/102", "25")).toBe(false);
  });
});
