import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveCardsQuick } from '@/hooks/usePokemonTcg';
import { useCatalog } from '@/hooks/useCatalog';
import { CardImage } from './CardImage';

const dollars = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'});
export default function EbayLiveDeals() {
  const quick = useLiveCardsQuick(), catalog = useCatalog();
  const cards = useMemo(() => {
    const source = catalog.data?.entries.filter(c=>c.kind==='raw' && c.image && c.market != null && c.market>0).map(c=>({id:c.id,name:c.name,set:c.set,number:c.number,variant:c.variant,image:c.image,market:c.market!,href:'/catalog/'+encodeURIComponent(c.id)})) ?? (quick.data??[]).filter(c=>c._image && c._apiId && c.market>0).map(c=>({id:c._apiId!,name:c.name,set:c.set,number:c.number,variant:c._variant,image:c._image,market:c.market,href:'/card/'+encodeURIComponent(c._apiId!)}));
    const seen = new Set<string>();
    return source.sort((a,b)=>b.market-a.market).filter(c=>{const key=`${c.name}|${c.set}|${c.number}`;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,18);
  }, [catalog.data,quick.data]);
  return <section className="terminal-card marketplace-gallery p-5 space-y-5" aria-labelledby="marketplace-title">
    <h2 id="marketplace-title" className="font-bold">Explore marketplace listings</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">{cards.map(card=>{
      const query=encodeURIComponent([card.name,card.set,card.number,card.variant].filter(Boolean).join(' '));
      const url='https://www.ebay.com/sch/i.html?_nkw='+query;
      return <article key={card.id} className="marketplace-card min-w-0"><Link to={card.href}><CardImage src={card.image} alt={card.name} className="w-full aspect-[3/4] object-contain"/></Link><div className="p-3 space-y-2"><h3 className="font-bold">{card.name}</h3><p className="text-sm">{[card.set,card.number,card.variant].filter(Boolean).join(' · ')}</p><strong className="block text-primary">{dollars.format(card.market)}</strong><div className="flex flex-wrap gap-2 text-sm"><a href={url} target="_blank" rel="noopener noreferrer" className="underline">Active listings ↗</a><a href={url+'&LH_Complete=1&LH_Sold=1'} target="_blank" rel="noopener noreferrer" className="underline">Sold listings ↗</a></div></div></article>;
    })}</div>
    {!cards.length && <p role="status">{quick.isLoading || catalog.isLoading ? 'Loading featured cards…' : 'Featured quotes are temporarily unavailable. Use the card valuer below.'}</p>}
    <p className="text-sm text-muted-foreground">Featured raw cards and marketplace searches in one collection. Prices are source reference quotes, not verified sales. Match set, number, printing and condition; check shipping on eBay. Source releases are daily, with feed checks every 30 minutes.</p>
  </section>;
}
