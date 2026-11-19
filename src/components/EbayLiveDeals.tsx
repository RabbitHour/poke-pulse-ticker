import {isEnglishArtwork} from '@/lib/collectorFocus';
import { discoveryCards, nextDiscoverySeed } from '@/lib/discoveryCards';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveCardsQuick } from '@/hooks/usePokemonTcg';
import { useCatalog } from '@/hooks/useCatalog';
import { CardImage } from './CardImage';

const dollars = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'});
export default function EbayLiveDeals() {
  const [failed,setFailed]=useState<Set<string>>(()=>new Set());
  const [page,setPage] = useState(0);
  const [seed,setSeed] = useState(nextDiscoverySeed);
  const quick = useLiveCardsQuick(), catalog = useCatalog();
  const cards = useMemo(() => {
    const source = catalog.data?.entries.filter(c=>c.kind==='raw' && isEnglishArtwork(c) && c.image && c.market != null && c.market>0).map(c=>({id:c.id,name:c.name,set:c.set,number:c.number,variant:c.variant,image:c.image,market:c.market!,href:'/catalog/'+encodeURIComponent(c.id)})) ?? (quick.data??[]).filter(c=>c._image && c._apiId && c.market>0).map(c=>({id:c._apiId!,name:c.name,set:c.set,number:c.number,variant:c._variant,image:c._image,market:c.market,href:'/card/'+encodeURIComponent(c._apiId!)+(c._variant?'?variant='+encodeURIComponent(c._variant):'')}));
    return discoveryCards(source.filter(c=>c.image&&!failed.has(c.image)), 120, seed);
  }, [catalog.data,quick.data,failed,seed]);
  return <section className="terminal-card marketplace-gallery p-5 space-y-5" aria-labelledby="marketplace-title">
    <div className="flex flex-wrap justify-between items-center gap-3"><div><h2 id="marketplace-title" className="font-bold">Discover cards &amp; marketplace listings</h2><p className="text-sm text-muted-foreground">A fresh mix of English cards across sets. Reshuffle to explore more; source prices do not change with the selection.</p></div><Link to="/sets" className="market-action browse-sets">Browse Sets →</Link></div>
    <button className="market-action" onClick={()=>{setSeed(nextDiscoverySeed());setPage(0);}}>Reshuffle cards</button>
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">{cards.slice((page % Math.max(1,Math.ceil(cards.length/18)))*18,((page % Math.max(1,Math.ceil(cards.length/18)))+1)*18).map(card=>{
      const query=encodeURIComponent([card.name,card.set,card.number,card.variant].filter(Boolean).join(' '));
      const url='https://www.ebay.com/sch/i.html?_nkw='+query;
      return <article key={card.id} className="marketplace-card min-w-0"><Link to={card.href}><CardImage src={card.image} onUnavailable={()=>setFailed(prev=>new Set(prev).add(card.image!))} alt={card.name} className="w-full aspect-[3/4] object-contain"/></Link><div className="p-3 space-y-2"><h3 className="font-bold">{card.name}</h3><p className="text-sm">{[card.set,card.number,card.variant].filter(Boolean).join(' · ')}</p><strong className="block text-primary">{dollars.format(card.market)}</strong><div className="flex flex-wrap gap-2 text-sm"><a href={url} target="_blank" rel="noopener noreferrer" className="underline">Active listings ↗</a><a href={url+'&LH_Complete=1&LH_Sold=1'} target="_blank" rel="noopener noreferrer" className="underline">Sold listings ↗</a></div></div></article>;
    })}</div>
    {cards.length>18 && <div className="flex justify-center items-center gap-3"><button className="market-action" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>Previous cards</button><span className="text-sm">{page % Math.ceil(cards.length/18)+1} / {Math.ceil(cards.length/18)}</span><button className="market-action" onClick={()=>setPage(p=>(p+1)%Math.ceil(cards.length/18))}>Discover more cards →</button></div>}
    {!cards.length && <p role="status">{quick.isLoading || catalog.isLoading ? 'Loading featured cards…' : 'Featured quotes are temporarily unavailable. Use the card valuer below.'}</p>}
    <p className="text-sm text-muted-foreground">Discover different Pokémon and sets across a range of prices. Ranked leaders remain in the market sections below. Click any card to explore its exact record. Prices are source reference quotes, not verified sales. Match set, number, printing and condition; check shipping on eBay. Source releases are daily, with feed checks every 30 minutes.</p>
  </section>;
}
