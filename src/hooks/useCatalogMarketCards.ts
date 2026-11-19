import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCatalog } from './useCatalog';
import { catalogPricePool, comparableCatalogEntries } from '@/lib/marketCoverage';
import { loadYesterdayObservations } from '@/lib/yesterdayMovers';
import type { SealedProduct } from '@/data/marketData';

function useComparableCatalog() {
  const catalog=useCatalog();
  const observations=useQuery({queryKey:['yesterday-exact-observations'],queryFn:()=>loadYesterdayObservations(),staleTime:1800000,refetchInterval:1800000,retry:1,placeholderData:prev=>prev});
  return useMemo(()=>catalog.data ? comparableCatalogEntries(catalog.data.entries,observations.data??[],catalog.data.sourceUpdated) : [],[catalog.data,observations.data]);
}
/** All available exact consecutive-release quotes, not a premium-card sample. */
export function useCatalogMarketCards() {
  const comparable=useComparableCatalog();
  return useMemo(()=>{
    const changes=new Map(comparable.map(c=>[c.entry.id,c.change]));
    return catalogPricePool(comparable.map(c=>c.entry)).map(card=>({...card,change:changes.get(card._catalogId!)!}));
  },[comparable]);
}
export function useCatalogSealedProducts() {
  const comparable=useComparableCatalog();
  return useMemo<SealedProduct[]>(()=>comparable.filter(c=>c.entry.kind==='sealed').map(({entry:e,change})=>({
    name:e.name,type:/\bcase\b/i.test(e.name)?'Case':/elite trainer box/i.test(e.name)?'ETB':/booster box/i.test(e.name)?'Booster Box':/booster pack/i.test(e.name)?'Booster Pack':/blister/i.test(e.name)?'Blister':'Sealed',
    market:e.market!,low:e.market!,change,image:e.image,sourceUpdated:e.sourceUpdated??undefined,
  })),[comparable]);
}
