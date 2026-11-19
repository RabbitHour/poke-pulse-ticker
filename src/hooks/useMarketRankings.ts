import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useCatalog} from './useCatalog';
import {useObservedProducts} from './useObservedProducts';
import {rankingRecords} from '@/lib/marketRankings';
import {loadRankingObservations} from '@/lib/rankingDelivery';
import type {CardData} from '@/data/marketData';
const EMPTY:CardData[]=[];
export function useMarketRankings(){
 const catalog=useCatalog();const observed=useObservedProducts(EMPTY);
 const source=catalog.data?.sourceUpdated??'';
 const history=useQuery({queryKey:['ranking-observations',source],queryFn:()=>loadRankingObservations(source),enabled:Boolean(source),staleTime:3600000,refetchInterval:3600000,retry:1});
 const records=useMemo(()=>rankingRecords([...(catalog.data?.entries??[]),...observed.gradedRecords],history.data??[],source),[catalog.data,observed.gradedRecords,history.data,source]);
 return {records,source,isLoading:catalog.isLoading||history.isLoading,isError:catalog.isError||history.isError,checkedAt:Math.min(catalog.dataUpdatedAt||Infinity,history.dataUpdatedAt||Infinity),refetch:()=>Promise.all([catalog.refetch(),history.refetch()])};
}
