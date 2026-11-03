import type { CatalogEntry } from "@/hooks/useCatalog";
import { getCardToken } from "./tokenSymbols";
export function catalogSymbol(e:CatalogEntry):string {
 if(e.kind==='digital')return 'PKT-'+e.setId.toUpperCase()+'-'+e.number;
 if(e.kind==='sealed')return (e.category==='etb'?'ETB':e.category==='etb_case_10'?'ETBC':e.category==='booster_box_36'?'BB':e.category==='booster_case_6'?'BBC':e.category==='booster_bundle'?'BND':'SEA')+'-'+e.setId.toUpperCase()+'-'+(e.productId||e.id.replace(/\W/g,'').slice(-8));
 return getCardToken({name:e.name,set:e.set,setCode:e.setId,number:e.number.split("/")[0],market:e.market??0,low:0,mid:0,change:0,grade:e.grade})+(e.variant?'.'+e.variant.replace(/[^a-z]/gi,'').slice(0,3).toUpperCase():'');
}
