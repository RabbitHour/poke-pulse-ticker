import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePriceAlerts, useDeletePriceAlert, type PriceAlert } from "@/hooks/usePriceAlerts";
import { useQuery } from "@tanstack/react-query";
import { fetchCardById, getBestPrice } from "@/lib/pokemonTcgApi";
import TerminalHeader from "@/components/TerminalHeader";
import ProGate from "@/components/ProGate";
import TickerBar from "@/components/TickerBar";
import AuthModal from "@/components/AuthModal";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import DeltaAlerts from "@/components/DeltaAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, BellRing, Trash2, Loader2, TrendingDown, TrendingUp, CheckCircle, Activity } from "lucide-react";

const PriceAlerts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const { data: alerts, isLoading } = usePriceAlerts();
  const deleteAlert = useDeletePriceAlert();

  // Fetch live prices for all alert cards
  const cardIds = useMemo(() => alerts?.map((a) => a.card_api_id) ?? [], [alerts]);
  const { data: livePrices } = useQuery({
    queryKey: ["alert-prices", cardIds.join(",")],
    queryFn: async () => {
      const prices: Record<string, number> = {};
      for (let i = 0; i < cardIds.length; i += 5) {
        const batch = cardIds.slice(i, i + 5);
        await Promise.allSettled(
          batch.map(async (id) => {
            const card = await fetchCardById(id);
            const p = getBestPrice(card);
            if (p) prices[id] = p.market;
          })
        );
      }
      return prices;
    },
    enabled: cardIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <TerminalHeader />
        <TickerBar />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center space-y-4">
          <h1 className="font-mono text-lg font-bold text-foreground">Price Alerts</h1>
          <Link to="/#my-pulse" className="market-action inline-block">Open browser-saved cards &amp; price targets</Link>
          <p className="font-mono text-sm text-muted-foreground">Sign in to manage your price alerts.</p>
          <button onClick={() => setShowAuth(true)} className="font-mono text-sm font-semibold bg-primary text-primary-foreground rounded px-6 py-2.5 hover:opacity-90">Sign In</button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </main>
      </div>
    );
  }

  const activeAlerts = alerts?.filter((a) => !a.is_triggered) ?? [];
  const triggeredAlerts = alerts?.filter((a) => a.is_triggered) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TerminalHeader />
      <TickerBar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </button>

        <Tabs defaultValue="price" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="price" className="font-mono text-xs data-[state=active]:bg-primary/20">
              <Bell className="w-3.5 h-3.5 mr-1.5" /> Price Alerts
            </TabsTrigger>
            <TabsTrigger value="delta" className="font-mono text-xs data-[state=active]:bg-primary/20">
              <Activity className="w-3.5 h-3.5 mr-1.5" /> Volatility Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price">
            <ProGate feature="Price alerts & notifications">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="font-mono text-xs text-muted-foreground">Loading alerts…</span>
                </div>
              ) : !alerts || alerts.length === 0 ? (
                <div className="terminal-card p-8 text-center space-y-3">
                  <BellRing className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="font-mono text-sm text-muted-foreground">No price alerts yet.</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    Visit any card's detail page and set a target price to create an alert.
                  </p>
                  <button onClick={() => navigate("/sets")} className="font-mono text-xs font-semibold bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90">
                    Browse Cards
                  </button>
                </div>
              ) : (
                <>
                  {activeAlerts.length > 0 && (
                    <div className="terminal-card overflow-hidden">
                      <div className="border-b border-border px-4 py-3">
                        <h2 className="font-mono text-xs tracking-widest text-secondary uppercase font-semibold">
                          Active Alerts ({activeAlerts.length})
                        </h2>
                      </div>
                      <div className="divide-y divide-border">
                        {activeAlerts.map((alert) => (
                          <AlertRow key={alert.id} alert={alert} currentPrice={livePrices?.[alert.card_api_id]} onDelete={() => deleteAlert.mutate(alert.id)} onNavigate={() => navigate(`/card/${alert.card_api_id}`)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {triggeredAlerts.length > 0 && (
                    <div className="terminal-card overflow-hidden opacity-75 mt-4">
                      <div className="border-b border-border px-4 py-3">
                        <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase font-semibold">
                          Triggered ({triggeredAlerts.length})
                        </h2>
                      </div>
                      <div className="divide-y divide-border">
                        {triggeredAlerts.map((alert) => (
                          <AlertRow key={alert.id} alert={alert} currentPrice={livePrices?.[alert.card_api_id]} onDelete={() => deleteAlert.mutate(alert.id)} onNavigate={() => navigate(`/card/${alert.card_api_id}`)} triggered />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </ProGate>
          </TabsContent>

          <TabsContent value="delta">
            <ProGate feature="Volatility alerts (Whale tier)">
              <DeltaAlerts />
            </ProGate>
          </TabsContent>
        </Tabs>

        <FinancialDisclaimer compact />
      </main>
    </div>
  );
};

function AlertRow({ alert, currentPrice, onDelete, onNavigate, triggered }: {
  alert: PriceAlert;
  currentPrice?: number;
  onDelete: () => void;
  onNavigate: () => void;
  triggered?: boolean;
}) {
  const isBelow = alert.direction === "below";
  const hitTarget = currentPrice !== undefined && (isBelow ? currentPrice <= alert.target_price : currentPrice >= alert.target_price);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      {alert.card_image && (
        <img src={alert.card_image} alt="" className="w-8 h-11 rounded object-cover cursor-pointer" onClick={onNavigate} />
      )}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onNavigate}>
        <p className="font-mono text-xs text-foreground font-medium truncate">{alert.card_name}</p>
        <p className="font-mono text-[9px] text-muted-foreground truncate">{alert.card_set} • #{alert.card_number}</p>
      </div>
      <div className="text-right space-y-0.5">
        <div className="flex items-center gap-1 justify-end">
          {isBelow ? <TrendingDown className="w-3 h-3 text-terminal-green" /> : <TrendingUp className="w-3 h-3 text-terminal-amber" />}
          <span className="font-mono text-xs font-semibold text-foreground">
            ${Number(alert.target_price).toFixed(2)}
          </span>
        </div>
        {currentPrice !== undefined && (
          <p className={`font-mono text-[10px] ${hitTarget ? "text-terminal-green font-semibold" : "text-muted-foreground"}`}>
            {hitTarget && !triggered ? "🎯 " : ""}Now ${currentPrice.toFixed(2)}
          </p>
        )}
        {triggered && (
          <div className="flex items-center gap-1 justify-end">
            <CheckCircle className="w-3 h-3 text-terminal-green" />
            <span className="font-mono text-[9px] text-terminal-green">Triggered</span>
          </div>
        )}
      </div>
      <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default PriceAlerts;
