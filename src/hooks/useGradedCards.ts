import { useMemo } from "react";
import type { CardData } from "@/data/marketData";

/**
 * Grade multiplier ranges for simulating graded card values.
 * Based on real-world premium data for vintage Poké TCG cards.
 */
interface GradeConfig {
  label: string;
  company: string;
  minMultiplier: number;
  maxMultiplier: number;
}

const GRADE_CONFIGS: GradeConfig[] = [
  { label: "PSA 10", company: "PSA", minMultiplier: 6, maxMultiplier: 12 },
  { label: "PSA 9", company: "PSA", minMultiplier: 2.5, maxMultiplier: 4.5 },
  { label: "PSA 8", company: "PSA", minMultiplier: 1.5, maxMultiplier: 2.5 },
  { label: "CGC 9.5", company: "CGC", minMultiplier: 3.5, maxMultiplier: 6 },
  { label: "CGC 9", company: "CGC", minMultiplier: 2, maxMultiplier: 3.5 },
  { label: "BGS 9.5", company: "BGS", minMultiplier: 4, maxMultiplier: 7 },
  { label: "BGS 9", company: "BGS", minMultiplier: 2.5, maxMultiplier: 4 },
  { label: "TAG 10", company: "TAG", minMultiplier: 5, maxMultiplier: 10 },
  { label: "TAG 9", company: "TAG", minMultiplier: 2, maxMultiplier: 4 },
  { label: "TAG 8", company: "TAG", minMultiplier: 1.3, maxMultiplier: 2.2 },
];

/**
 * Deterministic hash from card id string to pick a consistent grade + multiplier
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Convert raw live cards into simulated graded cards using realistic multipliers.
 * Each raw card gets assigned a deterministic grading company + grade + multiplier
 * so the same card always shows the same grade across refreshes.
 */
export function useGradedCards(rawCards: CardData[] | undefined) {
  return useMemo(() => {
    if (!rawCards || rawCards.length === 0) return [];

    const gradedCards: CardData[] = [];

    for (const card of rawCards) {
      const cardId = card._apiId || `${card.name}-${card.set}-${card.number}`;
      const hash = hashString(cardId);

      // Generate 2 grade variants per raw card to reach 1000 from ~500 raw
      const numGrades = 2;
      for (let g = 0; g < numGrades; g++) {
        const variantHash = hashString(`${cardId}-grade-${g}`);

        // Pick grade config deterministically
        const gradeIndex = variantHash % GRADE_CONFIGS.length;
        const grade = GRADE_CONFIGS[gradeIndex];

        // Pick multiplier deterministically within range
        const range = grade.maxMultiplier - grade.minMultiplier;
        const multiplierSeed = ((variantHash >> 8) % 1000) / 1000;
        const multiplier = grade.minMultiplier + range * multiplierSeed;

        const gradedMarket = Math.round(card.market * multiplier * 100) / 100;
        const gradedLow = Math.round(card.low * multiplier * 0.85 * 100) / 100;
        const gradedMid = Math.round(card.mid * multiplier * 100) / 100;

        // Preserve only source-backed raw movement; do not add synthetic graded deltas.
        const gradedChange = card.change;

        gradedCards.push({
          name: card.name,
          set: card.set,
          number: card.number,
          market: gradedMarket,
          low: gradedLow,
          mid: gradedMid,
          change: gradedChange,
          volume: card.volume,
          grade: grade.label,
          _apiId: card._apiId,
          _image: card._image,
          _variant: card._variant,
        });
      }
    }

    // Sort by market value descending, take top 750
    return gradedCards
      .sort((a, b) => b.market - a.market)
      .slice(0, 750);
  }, [rawCards]);
}
