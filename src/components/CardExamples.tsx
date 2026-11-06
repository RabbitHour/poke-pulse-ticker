import type { CardData } from '@/data/marketData';
import { CardImage } from './CardImage';
import { Link } from 'react-router-dom';
export default function CardExamples({cards}: {cards: CardData[]}) {
  return <div className="flex flex-wrap gap-5 py-3">{cards.filter(c=>c._image && c._apiId).slice(0,2).map(c=><Link key={c._apiId} to={'/card/'+encodeURIComponent(c._apiId!)} className="flex items-center gap-4 max-w-sm"><CardImage src={c._image} alt={c.name} className="w-24 h-36 object-contain shrink-0"/><span><strong className="block">{c.name}</strong><span className="text-sm">{c.set} · #{c.number}</span><span className="block text-sm">Match this printing before comparing prices.</span></span></Link>)}</div>;
}
