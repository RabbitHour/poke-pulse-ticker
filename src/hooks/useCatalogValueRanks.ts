import {useCatalog,type CatalogEntry} from './useCatalog';
import {rankingRecords,rankMarket,type RankingKind} from '@/lib/marketRankings';
type ValueRank={rank:number;of:number;kind:RankingKind};
const cache=new WeakMap<CatalogEntry[],Map<string,ValueRank>>();
const EMPTY=new Map<string,ValueRank>();
export function useCatalogValueRanks(){const q=useCatalog();const entries=q.data?.entries;if(!entries)return EMPTY;const saved=cache.get(entries);if(saved)return saved;const records=rankingRecords(entries,[],'');const ranks=new Map<string,ValueRank>();for(const kind of ['raw','graded','sealed'] as const){const rows=rankMarket(records,kind,'value');for(const r of rows)ranks.set(r.id,{rank:r.rank,of:rows.length,kind});}cache.set(entries,ranks);return ranks;}
