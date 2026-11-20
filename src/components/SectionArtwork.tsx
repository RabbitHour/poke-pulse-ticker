import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';
import { isEnglishArtwork } from '@/lib/collectorFocus';
import { discoveryCards } from '@/lib/discoveryCards';
import {useSelectionRotation} from '@/hooks/useSelectionRotation';
import { CardImage } from './CardImage';

/** Representative artwork is always labeled; never presented as a chart constituent or forecast. */
export default function SectionArtwork({ context, setId, ids, count = 6 }: {context:string;setId?:string;ids?:string[];count?:number}) {
 const catalog=useCatalog();
 const [page,setPage]=useState(0);
 const rotation=useSelectionRotation(()=>setPage(p=>p+1),30000);
 const [failed,setFailed]=useState<string[]>([]);
 const pool=useMemo(()=>discoveryCards((catalog.data?.entries??[]).filter(e=>e.kind==='raw'&&isEnglishArtwork(e)&&e.image&&!failed.includes(e.image)&&(!setId||e.setId===setId)&&(!ids||ids.includes(e.id))).map(e=>({...e,market:e.market??0})),Math.max(count,60),context),[catalog.data,setId,ids,count,context,failed]);
 const pages=Math.max(1,Math.ceil(pool.length/count));
 const cards=Array.from({length:Math.min(count,pool.length)},(_,i)=>pool[((page%pages)*count+i)%pool.length]);
 if(!cards.length)return <p className="section-artwork-empty">Related card artwork is currently unavailable.</p>;
 return <aside {...rotation.bindings} className="section-artwork" aria-label={context+' card artwork'}><p className="section-artwork-label">{ids?'Related exact records':'Explore '+context+' · representative cards'}</p>{pages>1&&<div className="artwork-controls"><button onClick={()=>setPage(p=>p+1)}>More cards</button><button aria-pressed={rotation.paused} onClick={()=>rotation.setPaused(p=>!p)}>{rotation.paused?'Resume artwork':'Pause artwork'}</button><small>Artwork rotates every 30 seconds · quote dates unchanged</small></div>}<div className="section-artwork-cards">{cards.map(e=><Link key={e.id} to={'/catalog/'+encodeURIComponent(e.id)} className="section-artwork-card"><CardImage highResolution src={e.image} alt={e.name} className="h-28 w-20 object-contain shrink-0" onUnavailable={()=>setFailed(p=>[...p,e.image])}/><span><strong>{e.name}</strong><small>{e.set} · #{e.number}</small></span></Link>)}</div></aside>;
}
