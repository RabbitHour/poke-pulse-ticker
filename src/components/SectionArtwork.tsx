import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';
import { isEnglishArtwork } from '@/lib/collectorFocus';
import { discoveryCards } from '@/lib/discoveryCards';
import { CardImage } from './CardImage';

/** Representative artwork is always labeled; never presented as a chart constituent or forecast. */
export default function SectionArtwork({ context, setId, ids, count = 2 }: {context:string;setId?:string;ids?:string[];count?:number}) {
 const catalog=useCatalog();
 const [failed,setFailed]=useState<string[]>([]);
 const cards=useMemo(()=>discoveryCards((catalog.data?.entries??[]).filter(e=>e.kind==='raw'&&isEnglishArtwork(e)&&e.image&&!failed.includes(e.image)&&(!setId||e.setId===setId)&&(!ids||ids.includes(e.id))).map(e=>({...e,market:e.market??0})),count,context),[catalog.data,setId,ids,count,context,failed]);
 if(!cards.length)return null;
 return <aside className="section-artwork" aria-label={context+' card artwork'}><p className="section-artwork-label">{ids?'Related exact records':'Explore '+context+' · representative cards'}</p><div className="section-artwork-cards">{cards.map(e=><Link key={e.id} to={'/catalog/'+encodeURIComponent(e.id)} className="section-artwork-card"><CardImage highResolution src={e.image} alt={e.name} className="h-28 w-20 object-contain shrink-0" onUnavailable={()=>setFailed(p=>[...p,e.image])}/><span><strong>{e.name}</strong><small>{e.set} · #{e.number}</small></span></Link>)}</div></aside>;
}
