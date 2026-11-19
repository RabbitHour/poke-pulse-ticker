import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Trash2, ArrowLeft, Star } from "lucide-react";
import TerminalHeader from "@/components/TerminalHeader";
import TickerBar from "@/components/TickerBar";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import AuthModal from "@/components/AuthModal";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import { useState } from "react";

const Watchlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: items, isLoading } = useWatchlist();
  const remove = useRemoveFromWatchlist();
  const [showAuth, setShowAuth] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <TerminalHeader />
        <TickerBar />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <Star className="w-10 h-10 text-terminal-amber mx-auto" />
          <h1 className="font-mono text-xl font-bold text-foreground">Your Watchlist</h1>
          <Link to="/#my-pulse" className="market-action inline-block">Open browser-saved cards &amp; price targets</Link>
          <p className="font-mono text-sm text-muted-foreground">
            Account watchlists require sign-in. Your browser-saved daily checklist is available without an account.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="font-mono text-sm font-semibold bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90"
          >
            Sign In
          </button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TerminalHeader />
      <TickerBar />

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Terminal
        </button>

        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-terminal-amber" />
          <h1 className="font-mono text-lg font-bold text-foreground">Watchlist</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {items?.length || 0} cards
          </span>
        </div>

        {isLoading ? (
          <div className="terminal-card p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground animate-pulse">Loading…</p>
          </div>
        ) : !items?.length ? (
          <div className="terminal-card p-8 text-center space-y-2">
            <Star className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-mono text-sm text-muted-foreground">
              Your watchlist is empty. Add cards from the card detail page.
            </p>
          </div>
        ) : (
          <div className="terminal-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Card</th>
                    <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Set</th>
                    <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Quote status</th>
                    <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Added</th>
                    <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="data-row cursor-pointer"
                        onClick={() => navigate(`/card/${item.card_api_id}`)}
                      >
                        <td className="px-4 py-2.5 font-mono text-sm text-foreground font-medium">
                          <div className="flex items-center gap-2">
                            {item.card_image && (
                              <img src={item.card_image} alt="" className="w-8 h-11 rounded object-cover" />
                            )}
                            {item.card_name}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {item.card_set} #{item.card_number}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-xs">Open exact printing to compare prices</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground text-right">
                          {new Date(item.added_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              remove.mutate(item.id);
                            }}
                            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <FinancialDisclaimer compact />
      </main>
    </div>
  );
};

export default Watchlist;
