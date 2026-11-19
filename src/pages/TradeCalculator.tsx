import {useCatalog} from '@/hooks/useCatalog';
import {catalogSearchText,matchesCatalogQuery} from '@/lib/catalogSearch';
import { useState, useMemo } from "react";
import { useCardSearch } from "@/hooks/usePokemonTcg";
import TerminalHeader from "@/components/TerminalHeader";
import TickerBar from "@/components/TickerBar";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import { ArrowLeftRight, Plus, X, Search, Loader2 } from "lucide-react";

interface TradeSideCard {
  id: string;
  name: string;
  set: string;
  number: string;
  image: string;
  price: number;
}

const TradeSide = ({
  label,
  cards,
  onAdd,
  onRemove,
  total,
  color,
}: {
  label: string;
  cards: TradeSideCard[];
  onAdd: (card: TradeSideCard) => void;
  onRemove: (id: string) => void;
  total: number;
  color: string;
}) => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const catalog=useCatalog();
  const fallback=useCardSearch(!catalog.data&&query.length>=3?query:"");
  const isLoading=catalog.isLoading||(!catalog.data&&fallback.isLoading);
  const results=useMemo(()=>catalog.data ? (query.length>=3?catalog.data.entries.filter(e=>e.kind==='raw'&&e.market!=null&&e.market>0&&e.image&&matchesCatalogQuery(catalogSearchText(e),query)).slice(0,8).map(e=>({_apiId:e.id,name:e.name,set:[e.set,'#'+e.number,e.variant].filter(Boolean).join(' · '),number:e.number,_image:e.image,market:e.market!})):[]) : fallback.data,[catalog.data,query,fallback.data]);

  return (
    <div className="terminal-card flex-1 min-w-0 overflow-hidden">
      <div className={`border-b border-border px-4 py-3 bg-${color}/5`}>
        <h2 className="font-mono text-xs tracking-widest text-secondary uppercase font-semibold">{label}</h2>
      </div>

      <div className="p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <button aria-label={"Add card to "+label} onClick={() => setSearching(!searching)} className="p-1.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-muted-foreground">{cards.length} card{cards.length !== 1 ? "s" : ""}</span>
          </div>

          {searching && (
            <div className="mt-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cards to add..."
                  className="w-full bg-muted rounded pl-8 pr-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 ring-primary"
                  autoFocus
                />
              </div>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" />}
              {query.length>=3&&!isLoading&&!results?.length&&<p className="text-sm">No exact catalog match. Try a name, set and printed number.</p>}
              {results && results.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.slice(0, 8).map((card) => (
                      <button
                        key={card._apiId}
                        onClick={() => {
                          onAdd({
                            id: card._apiId + "-" + Date.now(),
                            name: card.name,
                            set: card.set,
                            number: card.number,
                            image: card._image || "",
                            price: card.market,
                          });
                          setQuery("");
                          setSearching(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/80 text-left transition-colors"
                      >
                        {card._image && <img src={card._image} alt="" className="w-8 h-11 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10px] text-foreground truncate">{card.name}</p>
                          <p className="font-mono text-[9px] text-muted-foreground">{card.set}</p>
                        </div>
                        <span className="font-mono text-xs text-terminal-green font-semibold">${card.market.toFixed(2)}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card list */}
        <div className="space-y-1.5">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center gap-2 bg-muted/50 rounded p-2">
              <img src={card.image} alt="" className="w-7 h-10 rounded object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-foreground truncate">{card.name}</p>
                <p className="font-mono text-[9px] text-muted-foreground truncate">{card.set}</p>
              </div>
              <span className="font-mono text-xs text-foreground font-semibold">${card.price.toFixed(2)}</span>
              <button onClick={() => onRemove(card.id)} className="p-0.5 text-muted-foreground hover:text-terminal-red transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border pt-2 flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Total</span>
          <span className="font-mono text-sm font-bold text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const TradeCalculator = () => {
  const [sideA, setSideA] = useState<TradeSideCard[]>([]);
  const [sideB, setSideB] = useState<TradeSideCard[]>([]);

  const totalA = useMemo(() => sideA.reduce((sum, c) => sum + c.price, 0), [sideA]);
  const totalB = useMemo(() => sideB.reduce((sum, c) => sum + c.price, 0), [sideB]);
  const diff = totalA - totalB;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TerminalHeader />
      <TickerBar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-mono text-2xl font-bold text-foreground tracking-tight">Trade Calculator</h1>
          <p className="font-mono text-sm text-muted-foreground mt-1">Compare card values for a fair trade</p>
        </div>

        {/* Fairness indicator */}
        {(sideA.length > 0 || sideB.length > 0) && (
          <div className="terminal-card p-4 text-center">
            {Math.abs(diff) < 0.5 ? (
              <p className="font-mono text-sm text-terminal-green font-semibold">⚖️ Fair Trade — Values are even!</p>
            ) : (
              <p className="font-mono text-sm">
                <span className={diff > 0 ? "text-terminal-green" : "text-terminal-red"}>
                  {diff > 0 ? "Side A" : "Side B"} is ahead by ${Math.abs(diff).toFixed(2)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Two sides */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <TradeSide
            label="Side A — You Give"
            cards={sideA}
            onAdd={(c) => setSideA((s) => [...s, c])}
            onRemove={(id) => setSideA((s) => s.filter((c) => c.id !== id))}
            total={totalA}
            color="terminal-blue"
          />

          <div className="flex items-center justify-center py-2 md:py-0">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <TradeSide
            label="Side B — You Get"
            cards={sideB}
            onAdd={(c) => setSideB((s) => [...s, c])}
            onRemove={(id) => setSideB((s) => s.filter((c) => c.id !== id))}
            total={totalB}
            color="terminal-amber"
          />
        </div>
      </main>

      <FinancialDisclaimer />
    </div>
  );
};

export default TradeCalculator;
