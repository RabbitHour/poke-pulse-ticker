import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {useCatalog} from '@/hooks/useCatalog';
import {useSelectionRotation} from '@/hooks/useSelectionRotation';
import {isEnglishArtwork} from '@/lib/collectorFocus';

/** Catalog-linked discovery, not a price update or an invented official set logo. */
export default function FeaturedSetSpotlight(){
 const catalog=useCatalog();
 const [index,setIndex]=useState(0);

 const rotation=useSelectionRotation(()=>setIndex(i=>(i+1)%2),10000);
 const delta=useMemo(()=>(catalog.data?.entries??[]).find(e=>e.kind==='raw'&&/delta reign/i.test(e.set)&&isEnglishArtwork(e)&&e.image),[catalog.data]);
 const anniversary=index===0;
 return <section className="featured-set-spotlight" aria-label="Featured Pokémon sets" {...rotation.bindings}>
  <Link className="featured-set-link" to={anniversary?'/sets?set=30th':delta?'/sets?set='+encodeURIComponent(delta.setId):'/sets?set=DLR'}>
   <img src={anniversary?'/images/pokemon-30th-mark.svg':'/images/delta-reign-rayquaza.jpg'} width="280" height="180" alt={anniversary?'Pokémon 30th anniversary Pikachu mark':'Mega Rayquaza — official Delta Reign expansion illustration'}/>

   <span><small>Explore the collection</small><strong>{anniversary?'Pokémon 30th Anniversary':'Delta Reign'}</strong><span>Browse available cards →</span></span>
  </Link>
  <div className="spotlight-controls"><button aria-label="Show 30th Anniversary" aria-pressed={anniversary} onClick={()=>setIndex(0)}>30th Anniversary</button><button aria-label="Show Delta Reign" aria-pressed={!anniversary} onClick={()=>setIndex(1)}>Delta Reign</button><button aria-pressed={rotation.paused} onClick={()=>rotation.setPaused(p=>!p)}>{rotation.paused?'Resume':'Pause'}</button></div>
  <p className="spotlight-cadence">Alternates every 10 seconds; pauses while you interact.</p>
 </section>;
}
