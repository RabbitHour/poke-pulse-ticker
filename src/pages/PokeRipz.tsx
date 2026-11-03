import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRipzWallet, useRipPacks, useDigitalPortfolio } from "@/hooks/useRipz";
import { RIPZ_ERAS, PRODUCT_LABELS, PRODUCT_ICONS, RARITY_LABELS, RARITY_COLORS, type RipzEra, type RipzSet, type RipzProduct } from "@/data/ripzData";
import TerminalHeader from "@/components/TerminalHeader";
import TickerBar from "@/components/TickerBar";
import AuthModal from "@/components/AuthModal";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import pokeRipzLogo from "@/assets/poke-ripz-logo.png";
import { ArrowLeft, Coins, Package, Sparkles, Star, Trophy, Zap, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PokeRipz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [selectedEra, setSelectedEra] = useState<RipzEra | null>(null);
  const [selectedSet, setSelectedSet] = useState<RipzSet | null>(null);
  const [ripResult, setRipResult] = useState<any>(null);
  const [isRipping, setIsRipping] = useState(false);

  const { data: wallet } = useRipzWallet();
  const { data: digitalPortfolio } = useDigitalPortfolio();
  const ripPacks = useRipPacks();

  const handleRip = async (product: RipzProduct) => {
    if (!user) { setShowAuth(true); return; }
    if (!selectedSet || !selectedEra) return;
    setIsRipping(true);
    setRipResult(null);
    try {
      const result = await ripPacks.mutateAsync({
        productType: product.type,
        setId: selectedSet.id,
        setName: selectedSet.name,
        era: selectedEra.id,
        coinCost: product.coinCost,
        cardsPerPack: product.cardsPerPack,
        packCount: product.packCount,
      });
      // Delay for animation
      setTimeout(() => {
        setRipResult(result);
        setIsRipping(false);
      }, 1500);
    } catch {
      setIsRipping(false);
    }
  };

  const digitalStats = useMemo(() => {
    if (!digitalPortfolio) return { totalCards: 0, totalValue: 0, bestPull: null };
    const totalCards = digitalPortfolio.length;
    const totalValue = digitalPortfolio.reduce((s: number, c: any) => s + (c.rip_value || 0), 0);
    const bestPull = digitalPortfolio.reduce((best: any, c: any) => (!best || c.rip_value > best.rip_value) ? c : best, null);
    return { totalCards, totalValue, bestPull };
  }, [digitalPortfolio]);

  return (
    <div className="min-h-screen bg-background">
      <TerminalHeader />
      <TickerBar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-5">
        {/* Header */}
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </button>

        <div className="terminal-card p-5 flex flex-col sm:flex-row items-center gap-4">
          <img src={pokeRipzLogo} alt="Poké Ripz" width={180} height={90} className="drop-shadow-lg" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-mono text-xl font-bold text-foreground">Poké Ripz™</h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Digital pack ripping experience • Every era, every set, every product
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              © PGVA Ventures, LLC — All Rights Reserved
            </p>
          </div>
          {user && wallet && (
            <div className="terminal-card p-3 flex items-center gap-2 bg-accent/10">
              <Coins className="w-5 h-5 text-terminal-amber" />
              <div>
                <p className="font-mono text-xs text-muted-foreground">Balance</p>
                <p className="font-mono text-lg font-bold text-terminal-amber">{(wallet as any).balance?.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        {user && (
          <div className="grid grid-cols-3 gap-3">
            <div className="terminal-card p-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Digital Cards</p>
              <p className="font-mono text-lg font-bold text-foreground">{digitalStats.totalCards}</p>
            </div>
            <div className="terminal-card p-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Value</p>
              <p className="font-mono text-lg font-bold text-terminal-green">{digitalStats.totalValue.toLocaleString()}</p>
            </div>
            <div className="terminal-card p-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Best Pull</p>
              <p className="font-mono text-xs font-bold text-terminal-amber truncate">
                {digitalStats.bestPull ? `${(digitalStats.bestPull as any).card_rarity}` : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Rip Result Overlay */}
        <AnimatePresence>
          {isRipping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 3, -3, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-center"
              >
                <Package className="w-20 h-20 text-terminal-amber mx-auto mb-4" />
                <p className="font-mono text-lg font-bold text-foreground animate-pulse">RIPPING...</p>
                <p className="font-mono text-xs text-muted-foreground mt-2">Tearing open packs...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ripResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="terminal-card p-5 border-2 border-terminal-amber/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-bold text-terminal-amber flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Rip Results
                </h3>
                <button onClick={() => setRipResult(null)} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="terminal-card p-2 text-center">
                  <p className="font-mono text-[10px] text-muted-foreground">Cards Pulled</p>
                  <p className="font-mono text-base font-bold text-foreground">{ripResult.cards.length}</p>
                </div>
                <div className="terminal-card p-2 text-center">
                  <p className="font-mono text-[10px] text-muted-foreground">Total Value</p>
                  <p className="font-mono text-base font-bold text-terminal-green">{ripResult.totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {ripResult.cards
                  .sort((a: any, b: any) => b.rip_value - a.rip_value)
                  .slice(0, 20)
                  .map((card: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-accent/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{card.card_number}</span>
                        <span className={`font-mono text-[10px] font-semibold ${RARITY_COLORS[card.card_rarity] || 'text-muted-foreground'}`}>
                          {RARITY_LABELS[card.card_rarity] || card.card_rarity}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-terminal-green">{card.rip_value.toLocaleString()}</span>
                    </div>
                  ))}
                {ripResult.cards.length > 20 && (
                  <p className="font-mono text-[10px] text-muted-foreground text-center py-1">
                    + {ripResult.cards.length - 20} more cards...
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation: Era → Set → Products */}
        {!selectedEra ? (
          /* Era Selection */
          <div className="space-y-3">
            <h2 className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-terminal-amber" /> Choose Your Era
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RIPZ_ERAS.map((era) => (
                <motion.button
                  key={era.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEra(era)}
                  className="terminal-card p-4 text-left hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{era.icon}</span>
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {era.name}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">{era.years}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{era.sets.length} sets available</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : !selectedSet ? (
          /* Set Selection */
          <div className="space-y-3">
            <button onClick={() => setSelectedEra(null)} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Eras
            </button>
            <h2 className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
              <span className="text-lg">{selectedEra.icon}</span> {selectedEra.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedEra.sets.map((set) => (
                <motion.button
                  key={set.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSet(set)}
                  className="terminal-card p-4 text-left hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {set.symbol} {set.name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">{set.releaseYear} • {set.totalCards} cards</p>
                      <p className="font-mono text-[10px] text-terminal-amber mt-1">
                        From {set.products[0].coinCost.toLocaleString()} coins/pack
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Product Selection + Rip */
          <div className="space-y-3">
            <button onClick={() => setSelectedSet(null)} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to {selectedEra.name}
            </button>
            <div className="terminal-card p-4">
              <h2 className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
                {selectedSet.symbol} {selectedSet.name}
                <span className="font-mono text-[10px] text-muted-foreground font-normal">
                  ({selectedSet.releaseYear} • {selectedSet.totalCards} cards)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedSet.products.map((product) => (
                <motion.div
                  key={product.type}
                  whileHover={{ scale: 1.02 }}
                  className="terminal-card p-4 hover:border-terminal-amber/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{PRODUCT_ICONS[product.type]}</span>
                    <div>
                      <p className="font-mono text-sm font-bold text-foreground">{PRODUCT_LABELS[product.type]}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {product.packCount} pack{product.packCount !== 1 ? 's' : ''} • {product.cardsPerPack * product.packCount} cards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-terminal-amber" />
                      <span className="font-mono text-sm font-bold text-terminal-amber">{product.coinCost.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleRip(product)}
                      disabled={ripPacks.isPending || isRipping}
                      className="font-mono text-xs font-semibold bg-primary text-primary-foreground rounded px-4 py-1.5 hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {ripPacks.isPending || isRipping ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      RIP IT
                    </button>
                  </div>
                  {wallet && (wallet as any).balance < product.coinCost && (
                    <p className="font-mono text-[9px] text-terminal-red mt-2">Insufficient coins</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="terminal-card p-6 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-terminal-amber mx-auto" />
            <p className="font-mono text-sm text-foreground font-bold">Sign in to start ripping!</p>
            <p className="font-mono text-xs text-muted-foreground">Get 5,000 free coins to start your digital collection</p>
            <button onClick={() => setShowAuth(true)} className="font-mono text-xs font-semibold bg-primary text-primary-foreground rounded px-6 py-2 hover:opacity-90">
              Sign In
            </button>
          </div>
        )}

        <FinancialDisclaimer compact />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </main>
    </div>
  );
};

export default PokeRipz;
