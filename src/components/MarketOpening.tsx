import PokeHelp from "./PokeHelp";
import { ChartCandlestick } from "lucide-react";
import {ebayAffiliateLink} from "@/lib/ebay";
import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {useLiveCardsQuick} from "@/hooks/usePokemonTcg";
import {useCatalog} from "@/hooks/useCatalog";
import {catalogSymbol} from "@/lib/catalogSymbols";
import {CardImage} from "./CardImage";
export default function MarketOpening(){const catalog=useCatalog();const quick=useLiveCardsQuick();const [epoch,setEpoch]=useState(Math.floor(Date.now()/1800000));
 useEffect(()=>{const t=setInterval(()=>setEpoch(Math.floor(Date.now()/1800000)),30000);return()=>clearInterval(t);},[]);
 const cards=useMemo(()=>{const seen=new Set<string>();const full=(catalog.data?.entries??[]).filter(e=>e.kind==='raw'&&e.image&&e.market!==null&&e.market>=20).filter(e=>{const key=e.cardId||e.id;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,500);const pool=full.length?full:(quick.data??[]).map(c=>({id:c._apiId||c.name,cardId:c._apiId,name:c.name,set:c.set,setId:c.setCode||c.set,number:c.number,kind:'raw' as const,category:null,market:c.market,image:c._image||'',variant:c._variant,sourceUrl:'',sourceUpdated:null}));if(!pool.length)return[];const start=(epoch*6)%pool.length;return Array.from({length:Math.min(6,pool.length)},(_,i)=>pool[(start+i*83)%pool.length]);},[catalog.data,quick.data,epoch]);
 return <section className="market-opening" aria-labelledby="opening-title"><div className="opening-copy"><span className="opening-mark"><ChartCandlestick aria-hidden="true" /></span>
 <h1 id="opening-title">Poke Pulse Ticker</h1>
 <p className="opening-kicker">Collector Market Terminal</p>
 <p className="text-muted-foreground">Find a card, slab, or sealed product.</p>
 <nav aria-label="Market shortcuts" className="flex flex-wrap justify-center gap-2">
   <a className="market-action opening-primary" href="#card-valuer">Check a card value</a>
   <a className="market-action" href="#catalog">Search catalog</a>
   <a className="market-action" href="#market-charts">Market charts</a>
   <Link className="market-action" to="/account">Create a free account</Link>
 </nav></div>
 <PokeHelp />
 <p className="text-center text-sm text-muted-foreground">Featured quotes · eBay affiliate links may earn us a commission.</p>
 <div className="opening-gallery">{cards.map(c=><a className="opening-card" key={c.id} href={ebayAffiliateLink(`Pokemon ${c.name} ${c.set} ${c.number} ${c.variant||""}`,"opening-gallery")} target="_blank" rel="sponsored noopener noreferrer" title="Find this card on eBay · affiliate link"><CardImage src={c.image} alt={c.name} className="w-full aspect-[3/4] object-contain"/><div className="p-2"><span className="text-[10px] text-primary font-mono">{catalogSymbol(c)}</span><strong className="block text-xs truncate">{c.name}</strong><span className="text-sm font-bold">{c.market==null?'No quote':'$'+c.market.toFixed(2)}</span></div></a>)}</div></section>;
}
