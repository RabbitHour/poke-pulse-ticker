import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Search,ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLiveCardsQuick} from '@/hooks/usePokemonTcg';
import {useCatalog} from '@/hooks/useCatalog';
import {rotatingWindow,recordLink} from '@/lib/marketRecords';
import {CardImage} from './CardImage';
import {useQuery} from '@tanstack/react-query';
import {loadYesterdayObservations,selectYesterdayMovers} from '@/lib/yesterdayMovers';
import PulseEngineMark from './PulseEngineMark';
import YesterdayMover from './YesterdayMover';
export default function MarketOpening(){
 const catalog=useCatalog(),quick=useLiveCardsQuick();const [epoch,setEpoch]=useState(0),[search,setSearch]=useState('');
 const observations=useQuery({queryKey:['yesterday-exact-observations'],queryFn:()=>loadYesterdayObservations(),staleTime:1800000,refetchInterval:1800000,retry:1,placeholderData:prev=>prev});
 const yesterday=selectYesterdayMovers(catalog.data?.entries??[],observations.data??[]);
 useEffect(()=>{const t=setInterval(()=>setEpoch(e=>e+1),1800000);return()=>clearInterval(t);},[]);
 const cards=useMemo(()=>{const seen=new Set<string>();const pool=(catalog.data?.entries??[]).filter(e=>e.kind==='raw'&&e.image&&e.market>0).filter(e=>{const key=e.cardId||e.id;if(seen.has(key))return false;seen.add(key);return true;});const foil=pool.filter(e=>/holo|foil/i.test(e.variant||''));return rotatingWindow(foil.length>=6?foil:pool,epoch,6);},[catalog.data,epoch]);
 const fallback=rotatingWindow((quick.data??[]).filter(c=>c._apiId&&c._image&&c.market>0),epoch,6);
 function lookup(e:React.FormEvent){e.preventDefault();window.dispatchEvent(new CustomEvent('poke-value-search',{detail:search}));document.getElementById('card-valuer')?.scrollIntoView({behavior:'smooth'});}
 return <section className="market-opening" aria-labelledby="opening-title"><div className="opening-engine-layout"><YesterdayMover kind="raw" mover={yesterday.raw} date={yesterday.date} loading={observations.isLoading||catalog.isLoading}/><div className="opening-copy"><p className="opening-kicker">Source quotes · Collector terminal</p><PulseEngineMark/><h1 id="opening-title">Poké Pulse Engine</h1><p className="text-muted-foreground">Cards. Graded. Sealed. Find the exact printing.</p><form onSubmit={lookup} className="opening-search"><label className="sr-only" htmlFor="opening-search">Poké Search</label><Search aria-hidden="true" className="w-5 h-5"/><input id="opening-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Card name, set or number"/><Button type="submit">Value lookup <ArrowRight/></Button></form><nav className="flex flex-wrap justify-center gap-3" aria-label="Market shortcuts"><Button variant="outline" asChild><a href="#market-charts">Market charts</a></Button><Button variant="outline" asChild><a href="#forecast-results">Forecast history</a></Button><Button variant="ghost" asChild><Link to="/sets">Browse sets</Link></Button></nav></div><YesterdayMover kind="graded" mover={yesterday.graded} date={yesterday.date} loading={observations.isLoading||catalog.isLoading}/></div>
 <div className="opening-gallery">{cards.length?cards.map(c=><Link className="opening-card" key={c.id} to={recordLink(c)||'/#catalog'}><CardImage highResolution src={c.image} alt={c.name} loading="eager" className="w-full aspect-[3/4] object-contain"/><div className="p-2"><strong className="block text-xs line-clamp-2">{c.name}</strong><span className="block text-xs text-muted-foreground">{c.set} · {c.variant}</span><span className="text-sm font-bold">${c.market.toFixed(2)}</span></div></Link>):fallback.map(c=><Link className="opening-card" key={c._apiId} to={'/card/'+encodeURIComponent(c._apiId)}><CardImage highResolution src={c._image} alt={c.name} loading="eager" className="w-full aspect-[3/4] object-contain"/><div className="p-2"><strong className="block text-xs line-clamp-2">{c.name}</strong><span className="block text-xs">{c.set}</span><span className="font-bold">${c.market.toFixed(2)}</span></div></Link>)}{!cards.length&&!fallback.length&&<p className="text-sm">Card artwork is loading; no stand-in prices.</p>}</div>
 <p className="text-xs text-muted-foreground">Artwork and quote from the same source record · featured selection rotates every 30 minutes. TCGCSV publishes daily, not continuously.</p>
 <p className="text-xs text-muted-foreground">Yesterday’s movers rank absolute changes between consecutive UTC daily source releases for exact records, not completed sales.</p></section>;
}
