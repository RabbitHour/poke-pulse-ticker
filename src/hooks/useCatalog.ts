import { readPublishedData } from "@/lib/publishedData";
import { useQuery } from "@tanstack/react-query";
import type { ProductCategory } from "@/lib/productCategories";
export interface CatalogEntry {id:string;productId?:number;cardId?:string;name:string;set:string;setId:string;number:string;kind:"raw"|"sealed"|"graded"|"digital";category:ProductCategory|null;market:number|null;variant?:string|null;image:string;sourceUrl:string;sourceUpdated:string|null;grade?:string;sampleSize?:number}
export interface Catalog {version:number;generatedAt:string;sourceUpdated:string;englishCatalogCount:number;digitalCatalogCount?:number;providerGroups:number;pricedRecords:number;languageScope:string;entries:CatalogEntry[]}
export function useCatalog(){return useQuery({queryKey:["full-product-catalog"],queryFn:async()=>{return readPublishedData<Catalog>("catalog.json", d => !!d && typeof d==="object" && Array.isArray((d as Catalog).entries));},staleTime:1800000,refetchInterval:1800000,retry:1});}
export interface SealedHistory {generatedAt:string;sourceUpdated:string;methodology:string;categories:Record<string,{title:string;baseAt:string;available:number;matched:number;constituents:number;sourceUpdated:string;series:{t:string;v:number}[]}>}
export function useSealedHistory(){return useQuery({queryKey:["sealed-category-history"],queryFn:async()=>{return readPublishedData<SealedHistory>("sealed-indexes.json", d => !!d && typeof d==="object" && !!(d as SealedHistory).categories);},staleTime:1800000,refetchInterval:1800000,retry:1});}
