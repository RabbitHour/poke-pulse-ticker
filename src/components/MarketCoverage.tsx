import SectionArtwork from './SectionArtwork';
import { catalogPricePool } from '@/lib/marketCoverage';
import { useMemo } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { useObservedProducts } from '@/hooks/useObservedProducts';

export default function MarketCoverage() {
  const catalog = useCatalog();
  const observed = useObservedProducts();
  const counts = useMemo(() => {
    const entries = catalog.data?.entries ?? [];
    const priced = (kind: string) => entries.filter(e => e.kind === kind && e.market != null && e.market > 0).length;
    return {raw:catalogPricePool(entries).length,sealed:priced('sealed'),digital:entries.filter(e=>e.kind==='digital').length};
  }, [catalog.data]);
  return <section className="terminal-card p-5 space-y-3" aria-label="Available market coverage">
    <h2>Available market coverage</h2><SectionArtwork context="available market coverage" />
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[['Raw priced variants',counts.raw],['Sealed priced products',counts.sealed],['Graded quote records',observed.gradedRecords.length],['Digital catalog only',counts.digital]].map(([label,count])=><div key={label} className="rounded-lg bg-muted p-3"><dt className="text-sm">{label}</dt><dd className="text-2xl font-bold">{!catalog.data && label!=="Graded quote records" ? (catalog.isLoading ? "Loading…" : "Unavailable") : Number(count).toLocaleString()}</dd></div>)}
    </dl>
    <p className="text-sm text-muted-foreground">{catalog.data?.englishCatalogCount.toLocaleString() ?? "—"} physical English card entries indexed. Browse the full priced catalog below. A gallery shows a selection; its tile count is not the market sample. Index charts retain their recorded constituent counts. Graded coverage depends on available asking-price observations and cannot be enlarged by duplicating quotes.</p>
  </section>;
}
