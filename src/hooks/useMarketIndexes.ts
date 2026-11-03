import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export type MarketType = "raw" | "graded" | "sealed";
export interface IndexPoint { t:string; v:number }
export interface MarketIndex {type:MarketType;value:number;change:number|null;constituents:number;catalogItems:number|null;source:string;capturedAt:string;series:IndexPoint[];basket?:{q:string;median:number;n?:number;img?:string}[]}
export function useMarketIndexes(){
 const query=useQuery({queryKey:["market-index-snapshots"],queryFn:async()=>{
  const since=new Date(Date.now()-31*86400_000).toISOString();
  // Newest observations per market avoid starving a category at the server row cap.
  const results=await Promise.all((["raw","graded","sealed"] as const).map(type=>supabase.from("market_index_snapshots")
   .select("captured_at, market_type, value, change_pct, constituents, source, meta").eq("market_type",type)
   .gte("captured_at",since).order("captured_at",{ascending:false}).limit(1000)));
  for(const r of results)if(r.error)throw r.error;
  return results.flatMap(r=>r.data??[]).sort((a,b)=>a.captured_at.localeCompare(b.captured_at));
 },staleTime:120_000,refetchInterval:300_000,refetchIntervalInBackground:false,refetchOnWindowFocus:true,refetchOnReconnect:true});
 const indexes=useMemo(()=>{const out:Partial<Record<MarketType,MarketIndex>>={};
  for(const row of query.data??[]){if(!["raw","graded","sealed"].includes(row.market_type))continue;const type=row.market_type as MarketType;const v=Number(row.value);
   if(!Number.isFinite(v)||v<=0||!Number.isFinite(Date.parse(row.captured_at)))continue;
   const series=out[type]?.series??[];series.push({t:row.captured_at,v});const meta=(row.meta??{}) as Record<string,unknown>;
   out[type]={type,value:v,change:row.change_pct==null?null:Number(row.change_pct),constituents:row.constituents??0,
    catalogItems:typeof meta.catalogItems==="number"?meta.catalogItems:null,source:row.source,capturedAt:row.captured_at,series,
    basket:Array.isArray(meta.basket)?meta.basket as MarketIndex["basket"]:undefined};
  }return out;
 },[query.data]);
 return {indexes,isLoading:query.isLoading,isError:query.isError,dataUpdatedAt:query.dataUpdatedAt,refetch:query.refetch};
}
export interface MarketMover {id:number;name:string;number:string;set:string;market:number;prev?:number;change:number|null;image:string;url?:string}
export interface MarketMoversPayload {generatedAt:string;sourceUpdated:string;catalog:{singles:number;sealed:number;groups:number};singles:MarketMover[];sealed:MarketMover[];topSingles:MarketMover[];topSealed?:MarketMover[]}
export function useMarketMovers(){return useQuery({queryKey:["market-movers-24h"],queryFn:async()=>{
 const {data,error}=await supabase.from("index_cache").select("data, updated_at").eq("cache_key","market_movers_24h").maybeSingle();
 if(error)throw error;return (data?.data as unknown as MarketMoversPayload)??null;
},staleTime:120_000,refetchInterval:300_000,refetchIntervalInBackground:false,refetchOnWindowFocus:true});}
