import { useEffect, useMemo, useState } from "react";
import type { CardData } from "@/data/marketData";
import { CardImage } from "./CardImage";

/** Supplied quotes only: missing history is not a trading indicator. */
export default function DailySpotlight({ cards }: { cards: CardData[] }) {
  const [hour, setHour] = useState(() => Math.floor(Date.now() / 3600000));
  useEffect(() => {
    const timer = setInterval(() => setHour(Math.floor(Date.now() / 3600000)), 30000);
    return () => clearInterval(timer);
  }, []);
  const eligible = useMemo(() => cards.filter(c => Number.isFinite(c.market) && c.market > 0), [cards]);
  const card = eligible.length ? eligible[hour % eligible.length] : undefined;
  return <section className="terminal-card p-4" aria-label="Hourly card spotlight">
    <h2 className="font-bold">Hourly card spotlight</h2>
    {card ? <div className="flex flex-wrap gap-4 mt-3">
      <CardImage src={card._image || ""} alt={card.name} className="w-36 h-48 object-contain" />
      <div className="space-y-2">
        <h3 className="font-bold">{card.name}</h3>
        <p>{card.set} · #{card.number} {card.grade}</p>
        <p className="text-xl font-bold">Provider quote: ${card.market.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">Reference quote from the loaded feed; not a verified completed sale.</p>
        <p className="text-sm text-muted-foreground">Trading volume and technical indicators are not available for this quote.</p>
        <a className="market-action" href="#card-valuer">Search exact printing and history</a>
      </div>
    </div> : <p>No valid card quotes available yet.</p>}
  </section>;
}
