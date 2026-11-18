import type { CatalogEntry } from '@/hooks/useCatalog';

// 2026-11-18 — Match artwork only by name, set and collector number.
// Grade and price remain on the original graded record, never on the art record.
export function artworkKey(card: { name: string; set: string; number: string }) {
  const normalize = (s: string) => s.toLowerCase().replace(/♀/g, ' female ').replace(/♂/g, ' male ').replace(/★/g, ' star ').replace(/^(?:sv|swsh|sm|xy)\d*\s*[:—-]\s*/, '').replace(/[^a-z0-9]/g, '');
  const number = card.number.split('/')[0].trim().toLowerCase().replace(/^0+(?=\d)/, '');
  return `${normalize(card.name)}|${normalize(card.set)}|${number}`;
}

export function rawArtworkIndex(entries: CatalogEntry[]) {
  const index = new Map<string, CatalogEntry>();
  for (const entry of entries) {
    if (entry.kind === 'raw' && entry.image && entry.number) {
      const key = artworkKey(entry);
      const previous = index.get(key);
      // Prefer a catalog card identity over a product listing image.
      if (!previous || (!previous.cardId && entry.cardId)) index.set(key, entry);
    }
  }
  return index;
}

export function withRawArtwork(entry: CatalogEntry, index: Map<string, CatalogEntry>): CatalogEntry {
  if (entry.kind !== 'graded') return entry;
  const art = index.get(artworkKey(entry));
  return { ...entry, image: art?.image ?? '', imageProvenance: art ? {
    provider: art.imageProvenance?.provider ?? 'Raw card catalog',
    recordId: art.id,
    match: 'Raw card artwork · matching name, set and number; not a photo of the graded copy',
  } : undefined };
}
