import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {useCatalog} from '@/hooks/useCatalog';
import {useSelectionRotation} from '@/hooks/useSelectionRotation';
import {isEnglishArtwork} from '@/lib/collectorFocus';
import {CardImage} from './CardImage';

/** Catalog-linked discovery, not a price update or an invented official set logo. */
export default function FeaturedSetSpotlight(){
 const catalog=useCatalog();
 const [index,setIndex]=useState(0);
 const [failed,setFailed]=useState<string[]>([]);
 const rotation=useSelectionRotation(()=>setIndex(i=>(i+1)%2),10000);
 const delta=useMemo(()=>(catalog.data?.entries??[]).find(e=>e.kind==='raw'&&/delta reign/i.test(e.set)&&isEnglishArtwork(e)&&e.image&&!failed.includes(e.image)),[catalog.data,failed]);
 const anniversary=index===0;
 return <section className="featured-set-spotlight" aria-label="Featured Pokémon sets" {...rotation.bindings}>
  <Link className="featured-set-link" to={anniversary?'/sets?set=30th':delta?'/sets?set='+encodeURIComponent(delta.setId):'/sets?set=DLR'}>
   {anniversary?<img src="/images/pokemon-30th-mark.svg" width="96" height="96" alt="Pokémon 30th anniversary Pikachu mark"/>:delta?<CardImage highResolution src={delta.image} alt={delta.name+' · Delta Reign representative artwork'} className="spotlight-card" onUnavailable={()=>setFailed(p=>[...p,delta.image])}/>:<span className="spotlight-monogram" aria-hidden="true">Δ</span>}
   <span><small>Explore the collection</small><strong>{anniversary?'Pokémon 30th Anniversary':'Delta Reign'}</strong><span>Browse available cards →</span></span>
  </Link>
  <div className="spotlight-controls"><button aria-label="Show 30th Anniversary" aria-pressed={anniversary} onClick={()=>setIndex(0)}>30th Anniversary</button><button aria-label="Show Delta Reign" aria-pressed={!anniversary} onClick={()=>setIndex(1)}>Delta Reign</button><button aria-pressed={rotation.paused} onClick={()=>rotation.setPaused(p=>!p)}>{rotation.paused?'Resume':'Pause'}</button></div>
  <p className="spotlight-cadence">Alternates every 10 seconds; pauses while you interact.</p>
 </section>;
}
