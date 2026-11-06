import { Link } from 'react-router-dom';
import type { YesterdayMover as Mover } from '@/lib/yesterdayMovers';
import { CardImage } from './CardImage';
export default function YesterdayMover({ kind, mover, date, loading }: { kind: 'raw' | 'graded'; mover: Mover | null; date: string; loading: boolean }) {
  return <aside className="yesterday-mover" aria-label={`Yesterday’s strongest ${kind} mover`}>
    <h2 className="text-sm font-bold">Yesterday’s {kind} mover</h2>
    <p className="text-xs text-muted-foreground">{date} · UTC source releases</p>
    {mover ? <>
      <Link to={'/catalog/' + encodeURIComponent(mover.entry.id)} className="mover-art"><CardImage src={mover.entry.image} alt={mover.entry.name} loading="eager" className="w-full h-full object-contain" /></Link>
      {!mover.entry.image && <p className="text-xs text-muted-foreground">Exact record photo unavailable</p>}
      <h3 className="font-bold text-sm">{mover.entry.name}</h3>
      <p className="text-xs text-muted-foreground">{mover.entry.set} · {mover.entry.variant || mover.entry.grade}</p>
      <strong className={mover.change > 0 ? 'text-primary' : 'text-destructive'}>{mover.change > 0 ? '+' : ''}{mover.change.toFixed(2)}%</strong>
      <p className="text-sm">${mover.previous.toFixed(2)} → ${mover.price.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground break-words">{mover.from} → {mover.to}</p>
      <Link className="text-sm text-primary underline" to={'/catalog/' + encodeURIComponent(mover.entry.id)}>Exact record details</Link>
    </> : <div className="mover-unavailable"><p className="font-semibold text-sm">{loading ? 'Checking dated observations…' : 'Comparable move unavailable'}</p><p className="text-xs text-muted-foreground">{kind === 'graded' ? 'Two exact graded observations and a verified listing or certificate picture are required.' : 'Two consecutive dated source releases for the same exact printing are required.'}</p></div>}
  </aside>;
}