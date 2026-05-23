import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTraderGame } from "@/hooks/useTraderGame";
import TerminalHeader from "@/components/TerminalHeader";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import AuthModal from "@/components/AuthModal";
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3, Clock, Zap, Shield, Trophy, Lock, Gamepad2, Bot, Crown, Medal, Sparkles, ArrowRight, Star, ChevronRight } from "lucide-react";
import { STRIPE_TIERS } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import type { CardData } from "@/data/marketData";
import { getContestLeaderboard, type LeaderboardEntry, type BotDifficulty } from "@/data/tradingBots";
import BotActivityFeed from "@/components/BotActivityFeed";
// TournamentFomoBanner + CampaignProBanner removed — popups/FOMO banners disabled

const FREE_DAILY_TRADES = 3;

const getTradesUsedToday = (): number => {
  const key = `simtrader_trades_${new Date().toISOString().slice(0, 10)}`;
  return parseInt(localStorage.getItem(key) || "0", 10);
};

const incrementTradesToday = () => {
  const key = `simtrader_trades_${new Date().toISOString().slice(0, 10)}`;
  const current = getTradesUsedToday();
  localStorage.setItem(key, String(current + 1));
};

/* ── Animated Background Orbs ── */
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(160 84% 50%) 0%, transparent 70%)", animation: "float-orb 8s ease-in-out infinite" }} />
    <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(215 90% 62%) 0%, transparent 70%)", animation: "float-orb 10s ease-in-out infinite reverse" }} />
    <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(38 92% 60%) 0%, transparent 70%)", animation: "float-orb 12s ease-in-out infinite 2s" }} />
  </div>
);

/* ── Freemium Banner ── */
const FreemiumBanner = ({ tradesLeft, onUpgrade, loading }: { tradesLeft: number; onUpgrade: () => void; loading: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-xl border border-primary/20"
    style={{ background: "linear-gradient(135deg, hsl(225 18% 10%) 0%, hsl(225 20% 12%) 50%, hsl(220 22% 11%) 100%)" }}
  >
    <div className="absolute inset-0 shimmer-sweep opacity-30" />
    <div className="relative p-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/30">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
            <span className="font-mono text-[8px] font-bold text-primary-foreground">{tradesLeft}</span>
          </div>
        </div>
        <div>
          <p className="font-mono text-xs font-bold text-foreground">
            {tradesLeft}/{FREE_DAILY_TRADES} free trades remaining
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">Upgrade for unlimited trades + advanced orders</p>
        </div>
      </div>
      <button
        onClick={onUpgrade}
        disabled={loading}
        className="group relative font-mono text-xs font-bold px-5 py-2.5 rounded-lg overflow-hidden disabled:opacity-50 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, hsl(160 84% 45%) 0%, hsl(160 90% 40%) 100%)" }}
      >
        <div className="absolute inset-0 shimmer-sweep opacity-40" />
        <Zap className="relative h-3.5 w-3.5 text-primary-foreground" />
        <span className="relative text-primary-foreground">{loading ? "Loading..." : "Go Unlimited — $99/mo"}</span>
        <ArrowRight className="relative h-3 w-3 text-primary-foreground group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  </motion.div>
);

/* ── Trade Limit Modal ── */
const TradeLimitModal = ({ onUpgrade, onClose, loading }: { onUpgrade: () => void; onClose: () => void; loading: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-background max-w-md w-full"
      style={{ boxShadow: "0 0 60px hsl(160 84% 50% / 0.15), 0 25px 50px -12px hsl(225 40% 4% / 0.5)" }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at top, hsl(160 84% 50% / 0.1) 0%, transparent 60%)" }} />
      <div className="relative p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center ring-2 ring-primary/30" style={{ background: "linear-gradient(135deg, hsl(160 84% 50% / 0.15) 0%, hsl(160 84% 50% / 0.05) 100%)" }}>
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
              <span className="font-mono text-[8px] font-bold text-white">!</span>
            </div>
          </div>
        </div>
        <h3 className="font-mono text-base font-bold text-foreground mb-2">Daily Trade Limit Reached</h3>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">You've used all {FREE_DAILY_TRADES} free trades for today. Unlock the full SimTrader™ experience!</p>
        
        <div className="space-y-2 mb-6 text-left max-w-xs mx-auto">
          {[
            { icon: Zap, text: "Unlimited daily trades" },
            { icon: Trophy, text: "Daily & weekend contests" },
            { icon: BarChart3, text: "Limit orders & stop-losses" },
            { icon: Bot, text: "Compete against 10 AI bots" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-mono text-[11px] text-foreground">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onUpgrade}
          disabled={loading}
          className="group relative w-full py-3.5 rounded-xl font-mono text-sm font-bold overflow-hidden disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, hsl(160 84% 45%) 0%, hsl(160 90% 38%) 100%)", boxShadow: "0 0 30px hsl(160 84% 50% / 0.25)" }}
        >
          <div className="absolute inset-0 shimmer-sweep opacity-50" />
          <Gamepad2 className="relative h-4 w-4 text-primary-foreground" />
          <span className="relative text-primary-foreground">{loading ? "Loading..." : "Upgrade to Trader — $99/mo"}</span>
        </button>
        <button onClick={onClose} className="w-full mt-3 py-2 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          Come back tomorrow for more free trades
        </button>
        <a href="/pricing" className="block font-mono text-[10px] text-primary hover:underline mt-1">Compare all plans →</a>
      </div>
    </motion.div>
  </div>
);

const formatUSD = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── Hero / Splash for Unauthenticated Users ── */
const HeroSplash = ({ onSignIn }: { onSignIn: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="relative overflow-hidden rounded-2xl border border-primary/20 mt-2"
    style={{ background: "linear-gradient(160deg, hsl(225 22% 10%) 0%, hsl(225 18% 8%) 40%, hsl(220 25% 10%) 100%)" }}
  >
    <FloatingOrbs />
    <div className="absolute inset-0 shimmer-sweep opacity-20" />
    <div className="relative px-6 py-12 md:py-16 text-center space-y-5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 15 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30"
        style={{ background: "hsl(160 84% 50% / 0.08)" }}
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-[10px] font-semibold text-primary tracking-wider">POKÉ STOCK MARKET SIMULATOR</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-mono text-2xl md:text-4xl font-black text-foreground leading-tight"
      >
        Trade Cards.<br />
        <span className="text-primary" style={{ textShadow: "0 0 30px hsl(160 84% 50% / 0.4)" }}>Beat Real Players & Bots.</span><br />
        Win Contests.
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-xs text-muted-foreground max-w-md mx-auto leading-relaxed"
      >
        Start with $100,000 virtual cash. Trade based on live Poké card prices. 
        Compete against real players and 10 AI bots with unique strategies. No real money involved.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <button
          onClick={onSignIn}
          className="group relative font-mono text-sm font-bold px-8 py-3.5 rounded-xl overflow-hidden flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, hsl(160 84% 45%) 0%, hsl(160 90% 38%) 100%)", boxShadow: "0 0 40px hsl(160 84% 50% / 0.3)" }}
        >
          <div className="absolute inset-0 shimmer-sweep opacity-50" />
          <Gamepad2 className="relative h-4.5 w-4.5 text-primary-foreground" />
          <span className="relative text-primary-foreground">Play Free Now</span>
          <ArrowRight className="relative h-4 w-4 text-primary-foreground group-hover:translate-x-1 transition-transform" />
        </button>
        <span className="font-mono text-[10px] text-muted-foreground">{FREE_DAILY_TRADES} free trades/day · No credit card</span>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-lg mx-auto"
      >
        {[
          { icon: BarChart3, label: "Live Prices", desc: "Real market data" },
          { icon: Bot, label: "PvP + Bots", desc: "Real & AI opponents" },
          { icon: Trophy, label: "Contests", desc: "Daily & weekend" },
          { icon: Shield, label: "Risk Free", desc: "Virtual currency" },
        ].map(({ icon: Icon, label, desc }, i) => (
          <div key={i} className="text-center space-y-1.5">
            <div className="h-9 w-9 rounded-xl mx-auto flex items-center justify-center" style={{ background: "hsl(160 84% 50% / 0.08)", border: "1px solid hsl(160 84% 50% / 0.15)" }}>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="font-mono text-[10px] font-bold text-foreground">{label}</p>
            <p className="font-mono text-[8px] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </motion.div>
);

/* ── Main Page ── */
const SimTraderPage = () => {
  const { user, subscribed, tier } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const isTrader = subscribed && (tier === "premium" || tier === "team");

  const handleUpgrade = async () => {
    if (!user) { setShowAuth(true); return; }
    setUpgradeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_TIERS.premium.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {} finally { setUpgradeLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TerminalHeader />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 space-y-4">
        {/* TournamentFomoBanner + CampaignProBanner removed — no FOMO/promo popups */}
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative h-12 w-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(160 84% 50% / 0.15) 0%, hsl(160 84% 50% / 0.05) 100%)",
              border: "1px solid hsl(160 84% 50% / 0.3)",
              boxShadow: "0 0 25px hsl(160 84% 50% / 0.15)"
            }}
          >
            <Zap className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <h1 className="font-mono text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              SIMTRADER WORLD<span className="text-primary">™</span>
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">POKÉ STOCK MARKET SIMULATOR · LIVE DATA</p>
          </div>
          <div className="ml-auto">
            {isTrader ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "hsl(160 84% 50% / 0.1)", border: "1px solid hsl(160 84% 50% / 0.2)" }}>
                <Crown className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[10px] text-primary font-bold tracking-wider">TRADER</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-[10px] text-muted-foreground font-semibold tracking-wider">FREE MODE</span>
              </div>
            )}
          </div>
        </div>

        {user ? (
          <TradingDashboard
            isTrader={isTrader}
            onUpgrade={handleUpgrade}
            upgradeLoading={upgradeLoading}
            onShowLimitModal={() => setShowLimitModal(true)}
          />
        ) : (
          <HeroSplash onSignIn={() => setShowAuth(true)} />
        )}

        {showLimitModal && (
          <TradeLimitModal onUpgrade={handleUpgrade} onClose={() => setShowLimitModal(false)} loading={upgradeLoading} />
        )}

        <FinancialDisclaimer />
      </main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, sub, positive }: { icon: React.ReactNode; label: string; value: string; sub?: string; positive?: boolean }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: "spring", stiffness: 400 }}
    className="relative overflow-hidden rounded-xl border border-border"
    style={{
      background: "linear-gradient(180deg, hsl(225 18% 12%) 0%, hsl(225 20% 9%) 100%)",
      boxShadow: positive !== undefined
        ? positive
          ? "0 4px 20px hsl(160 84% 50% / 0.08)"
          : "0 4px 20px hsl(0 72% 55% / 0.08)"
        : "var(--shadow-card)",
    }}
  >
    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at top right, hsl(160 84% 50% / 0.05) 0%, transparent 70%)" }} />
    <div className="relative p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">{label}</span>
      </div>
      <p className={`font-mono text-base font-black ${positive !== undefined ? (positive ? "text-green-400" : "text-red-400") : "text-foreground"}`}>{value}</p>
      {sub && <p className={`font-mono text-[10px] mt-0.5 ${positive ? "text-green-400/80" : "text-red-400/80"}`}>{sub}</p>}
    </div>
  </motion.div>
);

/* ── Trading Dashboard ── */
const TradingDashboard = ({ isTrader, onUpgrade, upgradeLoading, onShowLimitModal }: {
  isTrader: boolean;
  onUpgrade: () => void;
  upgradeLoading: boolean;
  onShowLimitModal: () => void;
}) => {
  const { portfolio, holdings, orders, loading, tradableCards, placeOrder, totalValue, holdingsValue, pnl, pnlPct } = useTraderGame();
  const [tab, setTab] = useState<"market" | "holdings" | "orders" | "contests">("market");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderQty, setOrderQty] = useState(1);
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop_loss">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [tradesUsed, setTradesUsed] = useState(getTradesUsedToday());

  const tradesLeft = Math.max(0, FREE_DAILY_TRADES - tradesUsed);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="font-mono text-sm text-muted-foreground">Loading SimTrader World™...</p>
      </div>
    );
  }

  const handleTrade = () => {
    if (!selectedCard) return;
    if (!isTrader && tradesLeft <= 0) { onShowLimitModal(); return; }
    if (!isTrader && orderType !== "market") { onShowLimitModal(); return; }
    placeOrder(selectedCard, orderSide, orderQty, orderType, orderType === "limit" ? parseFloat(limitPrice) : undefined, orderType === "stop_loss" ? parseFloat(limitPrice) : undefined);
    if (!isTrader) { incrementTradesToday(); setTradesUsed(getTradesUsedToday()); }
    setSelectedCard(null);
    setOrderQty(1);
    setLimitPrice("");
  };

  const tabs = [
    { key: "market" as const, label: "MARKET", icon: BarChart3 },
    { key: "holdings" as const, label: "HOLDINGS", icon: Package },
    { key: "orders" as const, label: "ORDERS", icon: Clock },
    { key: "contests" as const, label: "CONTESTS", icon: Trophy, locked: !isTrader },
  ];

  return (
    <div className="space-y-5">
      {!isTrader && <FreemiumBanner tradesLeft={tradesLeft} onUpgrade={onUpgrade} loading={upgradeLoading} />}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Cash Balance" value={formatUSD(portfolio?.virtual_balance ?? 0)} />
        <StatCard icon={<Package className="h-4 w-4" />} label="Holdings Value" value={formatUSD(holdingsValue)} />
        <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Total Value" value={formatUSD(totalValue)} />
        <StatCard
          icon={pnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          label="P&L"
          value={`${pnl >= 0 ? "+" : ""}${formatUSD(pnl)}`}
          sub={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`}
          positive={pnl >= 0}
        />
      </div>

      <BotActivityFeed />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { if (t.locked) { onShowLimitModal(); return; } setTab(t.key); }}
            className={`relative font-mono text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              tab === t.key
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.locked && <Lock className="h-2.5 w-2.5 ml-0.5 opacity-60" />}
            {tab === t.key && (
              <motion.div
                layoutId="simtrader-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(160 84% 50%) 0%, hsl(160 84% 50% / 0.5) 100%)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Trade Panel */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl border border-primary/30 p-5 space-y-4"
              style={{
                background: "linear-gradient(180deg, hsl(225 18% 12%) 0%, hsl(225 20% 9%) 100%)",
                boxShadow: "0 0 30px hsl(160 84% 50% / 0.08), var(--shadow-card)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedCard._image && (
                    <div className="h-12 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border">
                      <img src={selectedCard._image} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{selectedCard.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{selectedCard.set} #{selectedCard.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-black text-foreground">{formatUSD(selectedCard.market)}</p>
                  <span className={`font-mono text-[10px] font-semibold ${selectedCard.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {selectedCard.change >= 0 ? "▲" : "▼"} {Math.abs(selectedCard.change).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOrderSide("buy")} className={`py-2.5 rounded-lg font-mono text-xs font-bold transition-all ${orderSide === "buy" ? "ring-2 ring-green-500/50" : "bg-muted text-muted-foreground"}`} style={orderSide === "buy" ? { background: "linear-gradient(135deg, hsl(145 60% 20%) 0%, hsl(145 50% 15%) 100%)", color: "hsl(145 80% 60%)" } : undefined}>
                  ▲ BUY
                </button>
                <button onClick={() => setOrderSide("sell")} className={`py-2.5 rounded-lg font-mono text-xs font-bold transition-all ${orderSide === "sell" ? "ring-2 ring-red-500/50" : "bg-muted text-muted-foreground"}`} style={orderSide === "sell" ? { background: "linear-gradient(135deg, hsl(0 50% 20%) 0%, hsl(0 40% 15%) 100%)", color: "hsl(0 80% 65%)" } : undefined}>
                  ▼ SELL
                </button>
              </div>

              <div className="flex gap-2">
                {(["market", "limit", "stop_loss"] as const).map(t => (
                  <button key={t} onClick={() => { if (!isTrader && t !== "market") { onShowLimitModal(); return; } setOrderType(t); }} className={`flex-1 py-2 rounded-lg font-mono text-[10px] font-semibold transition-all ${orderType === t ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground"} ${!isTrader && t !== "market" ? "opacity-40" : ""}`}>
                    {t === "stop_loss" ? "STOP-LOSS" : t.toUpperCase()}
                    {!isTrader && t !== "market" && <Lock className="inline h-2.5 w-2.5 ml-1" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-mono text-[10px] text-muted-foreground block mb-1.5">QUANTITY</label>
                  <input type="number" min={1} max={9999} value={orderQty} onChange={e => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                </div>
                {orderType !== "market" && (
                  <div className="flex-1">
                    <label className="font-mono text-[10px] text-muted-foreground block mb-1.5">{orderType === "limit" ? "LIMIT PRICE" : "STOP PRICE"}</label>
                    <input type="number" min={0.01} step={0.01} value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between font-mono text-xs px-1">
                <span className="text-muted-foreground">Estimated Total</span>
                <span className="text-foreground font-bold text-base">{formatUSD(selectedCard.market * orderQty)}</span>
              </div>

              <button
                onClick={handleTrade}
                className="w-full py-3 rounded-xl font-mono text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: orderSide === "buy"
                    ? "linear-gradient(135deg, hsl(145 70% 38%) 0%, hsl(145 65% 30%) 100%)"
                    : "linear-gradient(135deg, hsl(0 65% 45%) 0%, hsl(0 60% 38%) 100%)",
                  color: orderSide === "buy" ? "hsl(145 90% 90%)" : "hsl(0 0% 100%)",
                  boxShadow: orderSide === "buy"
                    ? "0 0 20px hsl(145 70% 40% / 0.3)"
                    : "0 0 20px hsl(0 65% 45% / 0.3)",
                }}
              >
                {orderSide === "buy" ? "▲" : "▼"} {orderSide.toUpperCase()} {orderQty}× {selectedCard.name}
              </button>

              <button onClick={() => setSelectedCard(null)} className="w-full py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market Tab */}
      {tab === "market" && (
        <div className="rounded-xl border border-border overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(225 18% 11%) 0%, hsl(225 20% 9%) 100%)" }}>
          <div className="grid grid-cols-[1fr_80px_70px_60px] gap-2 px-4 py-3 border-b border-border font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
            <span>Token</span><span className="text-right">Price</span><span className="text-right">Change</span><span></span>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {tradableCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedCard(card)}
                className="grid grid-cols-[1fr_80px_70px_60px] gap-2 px-4 py-3 border-b border-border/30 hover:bg-muted/40 cursor-pointer transition-all items-center group"
              >
                <div className="flex items-center gap-2">
                  <div className="h-10 w-8 rounded overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
                    <img src={card._image || "/icon-192.png"} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{card.name}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">{card.set}</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-right text-foreground font-semibold">{formatUSD(card.market)}</span>
                <span className={`font-mono text-[10px] text-right font-bold ${card.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {card.change >= 0 ? "+" : ""}{card.change.toFixed(2)}%
                </span>
                <button className="font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all text-primary" style={{ background: "hsl(160 84% 50% / 0.08)", border: "1px solid hsl(160 84% 50% / 0.15)" }}>
                  TRADE
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings Tab */}
      {tab === "holdings" && (
        <div className="rounded-xl border border-border overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(225 18% 11%) 0%, hsl(225 20% 9%) 100%)" }}>
          {holdings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="font-mono text-sm text-muted-foreground">No holdings yet</p>
              <p className="font-mono text-[10px] text-muted-foreground/60">Buy your first token from the Market tab!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-4 py-3 border-b border-border font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                <span>Token</span><span className="text-right">Qty</span><span className="text-right">Avg Cost</span><span className="text-right">Value</span>
              </div>
              {holdings.map(h => {
                const card = tradableCards.find(c => (c._apiId ?? `${c.set}-${c.number}`) === h.card_api_id);
                const currentPrice = card?.market ?? h.avg_cost;
                const value = currentPrice * h.quantity;
                const holdingPnl = (currentPrice - h.avg_cost) * h.quantity;
                return (
                  <div key={h.id} onClick={() => card && setSelectedCard(card)} className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-4 py-3 border-b border-border/30 hover:bg-muted/40 cursor-pointer transition-all items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-8 rounded overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
                        <img src={h.card_image || card?._image || "/icon-192.png"} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold truncate text-foreground">{h.card_name}</p>
                        <p className={`font-mono text-[9px] font-semibold ${holdingPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {holdingPnl >= 0 ? "+" : ""}{formatUSD(holdingPnl)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-right">{h.quantity}</span>
                    <span className="font-mono text-[10px] text-right text-muted-foreground">{formatUSD(h.avg_cost)}</span>
                    <span className="font-mono text-xs text-right font-bold">{formatUSD(value)}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="rounded-xl border border-border overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(225 18% 11%) 0%, hsl(225 20% 9%) 100%)" }}>
          {orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="font-mono text-sm text-muted-foreground">No trade history yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_50px_60px_60px_60px] gap-1 px-4 py-3 border-b border-border font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                <span>Token</span><span>Side</span><span className="text-right">Qty</span><span className="text-right">Price</span><span className="text-right">Status</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {orders.map(o => (
                  <div key={o.id} className="grid grid-cols-[1fr_50px_60px_60px_60px] gap-1 px-4 py-3 border-b border-border/30 items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="h-8 w-6 rounded overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
                        <img src={(o as any).card_image || "/icon-192.png"} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-semibold truncate text-foreground">{o.card_name}</p>
                        <p className="font-mono text-[8px] text-muted-foreground">{new Date(o.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold ${o.side === "buy" ? "text-green-400" : "text-red-400"}`}>{o.side.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-right">{o.quantity}</span>
                    <span className="font-mono text-[10px] text-right">{formatUSD(o.price)}</span>
                    <span className={`font-mono text-[8px] text-right font-bold px-1.5 py-0.5 rounded ${o.status === "filled" ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-400"}`}>{o.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Contests Tab */}
      {tab === "contests" && <ContestsPanel userTotalValue={totalValue} userPnlPct={pnlPct} />}

      {/* Disclaimer */}
      <div className="rounded-xl border border-yellow-500/20 p-4" style={{ background: "hsl(38 80% 50% / 0.03)" }}>
        <p className="font-mono text-[9px] text-yellow-500/70 text-center leading-relaxed">
          ⚠️ SIMULATION ONLY — SimTrader uses virtual currency and does not involve real money trading. All trades are simulated based on live market data. No real financial transactions occur. For entertainment and educational purposes only.
        </p>
      </div>

      {/* Legal IP Notice */}
      <div className="rounded-xl border border-border/50 p-3">
        <p className="font-mono text-[8px] text-muted-foreground/50 text-center leading-relaxed">
          SimTrader™ is the exclusive proprietary intellectual property of PGVA Ventures, LLC. All rights reserved under U.S. and international copyright, trade secret, and intellectual property law. Unauthorized copying, reproduction, reverse-engineering, or creation of derivative works is strictly prohibited and will be prosecuted under the DMCA, CFAA, DTSA, and applicable state law. © {new Date().getFullYear()} PGVA Ventures, LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
};

/* ── Contests Panel ── */
const difficultyColor = (d: BotDifficulty) =>
  d === "easy" ? "text-green-400" : d === "medium" ? "text-yellow-400" : "text-red-400";
const difficultyBg = (d: BotDifficulty) =>
  d === "easy" ? "bg-green-500/10" : d === "medium" ? "bg-yellow-500/10" : "bg-red-500/10";

interface LivePlayer {
  user_id: string;
  display_name: string | null;
  total_portfolio_value: number;
  starting_balance: number;
}

const ContestsPanel = ({ userTotalValue, userPnlPct }: { userTotalValue: number; userPnlPct: number }) => {
  const today = new Date().toISOString().slice(0, 10);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const dailyLeaderboard = useMemo(() =>
    getContestLeaderboard(`daily_${today}`, 50000, Math.max(1, dayOfYear % 7), {
      name: "You",
      totalValue: userTotalValue,
      pnlPct: userPnlPct,
    }), [today, dayOfYear, userTotalValue, userPnlPct]);

  const weekendLeaderboard = useMemo(() =>
    getContestLeaderboard(`weekend_${today}`, 100000, 2, {
      name: "You",
      totalValue: userTotalValue,
      pnlPct: userPnlPct,
    }), [today, userTotalValue, userPnlPct]);

  const [activeContest, setActiveContest] = useState<"daily" | "weekend" | "pvp">("daily");

  // Fetch live players for PvP
  useEffect(() => {
    if (activeContest !== "pvp") return;
    setLiveLoading(true);
    const fetchPlayers = async () => {
      const { data: portfolios } = await supabase
        .from("trader_portfolios")
        .select("user_id, total_portfolio_value, starting_balance")
        .eq("is_active", true)
        .order("total_portfolio_value", { ascending: false })
        .limit(50);

      if (!portfolios || portfolios.length === 0) {
        setLivePlayers([]);
        setLiveLoading(false);
        return;
      }

      const userIds = portfolios.map((p: any) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]));

      setLivePlayers(portfolios.map((p: any) => ({
        ...p,
        display_name: profileMap.get(p.user_id) || null,
      })));
      setLiveLoading(false);
    };
    fetchPlayers();
  }, [activeContest]);

  // Build PvP leaderboard entries
  const pvpLeaderboard: LeaderboardEntry[] = useMemo(() => {
    const entries: LeaderboardEntry[] = livePlayers.map((p, _i) => {
      const pnl = ((p.total_portfolio_value - p.starting_balance) / p.starting_balance) * 100;
      return {
        id: p.user_id,
        name: p.display_name || `Trader ${p.user_id.slice(0, 6)}`,
        avatar: "👤",
        title: "Live Player",
        isBot: false,
        totalValue: p.total_portfolio_value,
        pnlPct: pnl,
        rank: 0,
      };
    });
    // Add user if not already in list
    const userInList = entries.some(e => e.name === "You");
    if (!userInList) {
      entries.push({
        id: "user",
        name: "You",
        avatar: "⭐",
        title: "You",
        isBot: false,
        totalValue: userTotalValue,
        pnlPct: userPnlPct,
        rank: 0,
      });
    }
    entries.sort((a, b) => b.pnlPct - a.pnlPct);
    entries.forEach((e, i) => (e.rank = i + 1));
    return entries;
  }, [livePlayers, userTotalValue, userPnlPct]);

  const leaderboard = activeContest === "daily" ? dailyLeaderboard : activeContest === "weekend" ? weekendLeaderboard : pvpLeaderboard;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(160 84% 50% / 0.1)", border: "1px solid hsl(160 84% 50% / 0.2)" }}>
          <Trophy className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="font-mono text-sm font-bold text-foreground">Trading Contests</h3>
          <p className="font-mono text-[9px] text-muted-foreground flex items-center gap-1"><Bot className="h-3 w-3" />Compete against real players & 10 AI bots</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "daily" as const, name: "DAILY BLITZ", status: "ACTIVE", statusColor: "bg-green-500/15 text-green-400", desc: "$50K · vs AI Bots", active: activeContest === "daily" },
          { key: "pvp" as const, name: "LIVE PVP", status: "LIVE", statusColor: "bg-primary/15 text-primary", desc: "Real players · Live", active: activeContest === "pvp" },
          { key: "weekend" as const, name: "WEEKEND WAR", status: "UPCOMING", statusColor: "bg-yellow-500/15 text-yellow-400", desc: "$100K · 48hr", active: activeContest === "weekend" },
        ].map(c => (
          <button
            key={c.key}
            onClick={() => setActiveContest(c.key)}
            className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all ${c.active ? "border-primary/40" : "border-border hover:border-border/80"}`}
            style={c.active ? { background: "linear-gradient(135deg, hsl(160 84% 50% / 0.05) 0%, hsl(225 20% 10%) 100%)", boxShadow: "0 0 20px hsl(160 84% 50% / 0.06)" } : { background: "linear-gradient(180deg, hsl(225 18% 11%) 0%, hsl(225 20% 9%) 100%)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-mono text-[9px] font-bold ${c.active ? "text-primary" : "text-foreground"}`}>{c.name}</span>
              <span className={`font-mono text-[7px] font-semibold px-1.5 py-0.5 rounded-full ${c.statusColor}`}>{c.status}</span>
            </div>
            <p className="font-mono text-[7px] text-muted-foreground">{c.desc}</p>
          </button>
        ))}
      </div>

      {/* Live PvP banner */}
      {activeContest === "pvp" && (
        <div className="rounded-lg border border-primary/30 p-3 flex items-center gap-3" style={{ background: "hsl(160 84% 50% / 0.04)" }}>
          <div className="h-2 w-2 rounded-full bg-primary pulse-live flex-shrink-0" />
          <p className="font-mono text-[10px] text-primary font-semibold">
            Live PvP — Compete against real players trading with live market data. Rankings update in real-time.
          </p>
        </div>
      )}

      {/* Leaderboard */}
      {liveLoading && activeContest === "pvp" ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(225 18% 11%) 0%, hsl(225 20% 9%) 100%)" }}>
          <div className="grid grid-cols-[30px_1fr_60px_70px] gap-2 px-4 py-3 border-b border-border font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
            <span>#</span><span>Trader</span><span className="text-right">P&L</span><span className="text-right">Value</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Trophy className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                <p className="font-mono text-xs text-muted-foreground">No players yet — be the first to trade!</p>
              </div>
            ) : leaderboard.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: entry.rank * 0.03 }}
                className={`grid grid-cols-[30px_1fr_60px_70px] gap-2 px-4 py-3 border-b border-border/30 items-center transition-all ${
                  entry.name === "You"
                    ? "ring-1 ring-primary/20"
                    : "hover:bg-muted/30"
                }`}
                style={entry.name === "You" ? { background: "linear-gradient(90deg, hsl(160 84% 50% / 0.06) 0%, transparent 100%)" } : undefined}
              >
                <span className="font-mono text-xs font-bold">
                  {entry.rank === 1 ? <Crown className="h-4 w-4 text-yellow-400" style={{ filter: "drop-shadow(0 0 4px hsl(38 92% 60% / 0.5))" }} /> :
                   entry.rank === 2 ? <Medal className="h-4 w-4 text-gray-400" /> :
                   entry.rank === 3 ? <Medal className="h-4 w-4 text-amber-600" /> :
                   <span className="text-muted-foreground">{entry.rank}</span>}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">{entry.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`font-mono text-[11px] font-semibold truncate ${entry.name === "You" ? "text-primary" : "text-foreground"}`}>
                        {entry.name}
                      </p>
                      {entry.isBot && entry.difficulty && (
                        <span className={`font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-full ${difficultyColor(entry.difficulty)} ${difficultyBg(entry.difficulty)}`}>
                          {entry.difficulty === "easy" ? "EASY" : entry.difficulty === "medium" ? "MED" : "HARD"}
                        </span>
                      )}
                      {entry.name === "You" && (
                        <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">YOU</span>
                      )}
                      {!entry.isBot && entry.name !== "You" && (
                        <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400">LIVE</span>
                      )}
                    </div>
                    <p className="font-mono text-[8px] text-muted-foreground truncate">
                      {entry.isBot ? entry.title : entry.name === "You" ? "Your Portfolio" : "Live Player"}
                    </p>
                  </div>
                </div>
                <span className={`font-mono text-[10px] text-right font-bold ${entry.pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {entry.pnlPct >= 0 ? "+" : ""}{entry.pnlPct.toFixed(2)}%
                </span>
                <span className="font-mono text-[10px] text-right text-foreground font-semibold">
                  {formatUSD(entry.totalValue)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{activeContest === "pvp" ? "Live rankings · Updates in real-time" : "Resets daily at midnight EST"}</span>
        <span className="font-mono text-[9px] text-primary font-bold flex items-center gap-1"><Star className="h-3 w-3" />Badge + 1 Month Extension</span>
      </div>
      <p className="font-mono text-[8px] text-muted-foreground/60 text-center">Contest prizes are in-app rewards only. No real monetary value. {activeContest === "pvp" ? "Live PvP rankings based on actual trading performance." : "AI bots simulate trading strategies for competitive gameplay."}</p>
    </div>
  );
};

export default SimTraderPage;
