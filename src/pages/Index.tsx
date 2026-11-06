import PokeHelp from "@/components/PokeHelp";
import DatedMovers from "@/components/DatedMovers";
import ForecastLedger from "@/components/ForecastLedger";
import SealedCategoryCharts from "@/components/SealedCategoryCharts";
import MarketOpening from "@/components/MarketOpening";
import CatalogExplorer from "@/components/CatalogExplorer";
import MarketOverview from "@/components/MarketOverview";
import CardValuer from "@/components/CardValuer";
import PortalPreview from "@/components/PortalPreview";
import { useObservedProducts } from "@/hooks/useObservedProducts";
import { useRef, useEffect, useMemo, useState } from "react";

import { rawCards, gradedCards, sealedProducts, getIndexValue, getIndexChange } from "@/data/marketData";
import { useLiveCards, useLiveCardsQuick } from "@/hooks/usePokemonTcg";
import { useGradedCards } from "@/hooks/useGradedCards";
import { useSealedProducts } from "@/hooks/useSealedProducts";
import TerminalHeader from "@/components/TerminalHeader";
import TickerBar from "@/components/TickerBar";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import MarketIndexCard from "@/components/MarketIndexCard";
import TrendingCards from "@/components/TrendingCards";
import InlineUpgradeNudge from "@/components/InlineUpgradeNudge";
import StickyUpgradeBanner from "@/components/StickyUpgradeBanner";
import IndexDayChart from "@/components/IndexDayChart";
import { useMarketStatus } from "@/components/MarketClosedOverlay";
import LazySection from "@/components/LazySection";
import ProGate from "@/components/ProGate";
import { useAlphaSignals } from "@/hooks/useAlphaSignals";
import { useTotalMarketValue } from "@/hooks/useIndexCache";
import { usePrefetchCards } from "@/hooks/usePrefetch";
import { usePricingHealth } from "@/hooks/usePricingHealth";
import { SkeletonIndexCard } from "@/components/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import ShareButton from "@/components/ShareButton";

import DailySpotlight from "@/components/DailySpotlight";
import LiveMarketPulse from "@/components/LiveMarketPulse";
import ValueUnlockPreview from "@/components/ValueUnlockPreview";
import PricePredictionGame from "@/components/PricePredictionGame";
import MarketUpdateBanner from "@/components/MarketUpdateBanner";
import TopMoversTable from "@/components/TopMoversTable";
import EraIndexCards from "@/components/EraIndexCards";
import MarketTrendSummary from "@/components/MarketTrendSummary";
import MarketIntelWidget from "@/components/MarketIntelWidget";
import TrustSignals from "@/components/TrustSignals";
import AlphaSignals from "@/components/AlphaSignals";
import GradingArbitrage from "@/components/GradingArbitrage";
import GradeRatioArbitrageBot from "@/components/GradeRatioArbitrageBot";
import AlphaAccuracy from "@/components/AlphaAccuracy";
import RecentNotableSales from "@/components/RecentNotableSales";
import SellOnEbaySection from "@/components/SellOnEbaySection";
import CardSearch from "@/components/CardSearch";
import PriceChart from "@/components/PriceChart";
import SignalSummary from "@/components/SignalSummary";
import MarketTabs from "@/components/MarketTabs";
import MarketCapSummary from "@/components/MarketCapSummary";
import VerifiedLeaderboard from "@/components/VerifiedLeaderboard";
import WhaleReport from "@/components/WhaleReport";
import ArbitrageFinder from "@/components/ArbitrageFinder";
import InstitutionalGate from "@/components/InstitutionalGate";
import SetHeatmap from "@/components/SetHeatmap";
import SealedBoxHeatmap from "@/components/SealedBoxHeatmap";
import JPtoENTracker from "@/components/JPtoENTracker";
import ImportFromTCGPlayer from "@/components/ImportFromTCGPlayer";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import TeamPlanCTA from "@/components/TeamPlanCTA";
import ReferralCTA from "@/components/ReferralCTA";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import InstallPrompt from "@/components/InstallPrompt";
// OnboardingWalkthrough removed — popups disabled except InstallPrompt
import PulseScore from "@/components/PulseScore";
import CorrelationMatrix from "@/components/CorrelationMatrix";
import PopReportDelta from "@/components/PopReportDelta";
import GamePromo from "@/components/GamePromo";
import PokeRaceSection from "@/components/PokeRaceSection";
import GradingROICalculator from "@/components/GradingROICalculator";
import AIMarketInsights from "@/components/AIMarketInsights";
import EbayLiveDeals from "@/components/EbayLiveDeals";
import PulseWalletWidget from "@/components/PulseWalletWidget";
import MacroCorrelation from "@/components/MacroCorrelation";
import LiveCardStrip from "@/components/LiveCardStrip";


const Index = () => {
  const { data: liveCards, isLoading, dataUpdatedAt } = useLiveCards();
  const { data: quickCards } = useLiveCardsQuick();
  const { health } = usePricingHealth();
  const marketOpen = useMarketStatus();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { checkSubscription } = useAuth();

  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const fallbackRawCards = useMemo(() => rawCards.map((card) => ({ ...card, change: 0 })), []);
  const fallbackGradedCards = useMemo(() => gradedCards.map((card) => ({ ...card, change: 0 })), []);
  const fallbackSealedProducts = useMemo(() => sealedProducts.map((product) => ({ ...product, change: 0 })), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartRefreshKey((k) => k + 1);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast({
        title: "Checking subscription status",
        description: "Access depends on the server-confirmed payment status.",
      });
      checkSubscription();
      setSearchParams({}, { replace: true });
    } else if (checkout === "canceled") {
      toast({
        title: "Checkout canceled",
        description: "No changes were made.",
        variant: "destructive",
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, checkSubscription, setSearchParams, toast]);

  const displayCards = (liveCards?.length ? liveCards : quickCards) ?? [];
  const observed = useObservedProducts(liveCards);
  const liveGradedCards = observed.graded;
  const displayGraded = liveGradedCards;
  const liveSealedProducts = observed.sealed;
  const displaySealed = liveSealedProducts;
  const hasHealthyLiveCoverage = (health?.signalStrength ?? 0) >= 34;
  const isLive = !!liveCards && liveCards.length > 0 && hasHealthyLiveCoverage;

  const rawIndex = getIndexValue(displayCards);
  const rawChange = getIndexChange(displayCards);
  const gradedIndex = getIndexValue(displayGraded);
  const gradedChange = getIndexChange(displayGraded);
  const sealedIndex = getIndexValue(displaySealed);
  const sealedChange = getIndexChange(displaySealed);

  const totalMarketValue = useTotalMarketValue(
    rawIndex,
    gradedIndex,
    sealedIndex,
    displayCards.length,
    displayGraded.length,
    displaySealed.length
  );

  const alphaSignals = useAlphaSignals(displayCards);

  const topMover = useMemo(() => {
    const sorted = [...displayCards].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return sorted[0] || null;
  }, [displayCards]);

  const prefetchIds = useMemo(
    () =>
      displayCards
        .slice(0, 10)
        .map((c) => c._apiId)
        .filter(Boolean) as string[],
    [displayCards]
  );

  usePrefetchCards(prefetchIds);

  const cardsWithImages = useMemo(() => displayCards.filter((c) => c._image), [displayCards]);

  const handleSearchFocus = () => {
    document.getElementById("card-valuer")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const input = document.getElementById("card-valuer")?.querySelector("input");
      input?.focus();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background bright-market">
      {/* StickyUpgradeBanner removed — popups disabled */}
      <TerminalHeader />
      <TickerBar
        cards={displayCards}
        isLive={isLive}
        lastUpdated={isLive ? (dataUpdatedAt || Date.now()) : undefined}
      />


      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 lg:px-6 py-2 sm:py-4 space-y-2.5 sm:space-y-3"
      >
        <MarketOpening />
        <CardValuer id="card-valuer" compact />

        <nav aria-label="Market page shortcuts" className="flex flex-wrap gap-2"><a className="market-action" href="#market-charts">Market charts</a><a className="market-action" href="#card-valuer">Free card valuer</a><a className="market-action" href="#poke-help">Ask Poke</a><a className="market-action" href="/account">Free account & reports</a></nav>

        {/* === LIVE CARD STRIP — TOP: 18 highest-value live cards with names + prices === */}
        <LiveCardStrip
          title="FEATURED RAW CARDS"
          subtitle="Available source quotes • feed checked every 30 minutes"
          count={18}
          mode="value"
        />

        {/* === PULSE ENGINE WALLET — PRO USERS ONLY === */}
        <div className="market-note">Explore cards and market observations below. Simulated trading is available separately in the navigation.</div>

        {/* === EBAY LIVE DEALS — MOVED UP for buy intent === */}
        <LazySection minHeight="200px">
          <EbayLiveDeals />
        </LazySection>

        {/* === MARKET PULSE + NOTABLE SALES === */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          <div className="terminal-card p-4"><h2 className="font-bold text-lg">Featured card feed</h2><p className="text-sm text-muted-foreground mt-2">{displayCards.length.toLocaleString()} featured source records loaded. This showcase is a subset; the full indexed catalog is above. Raw quotes refresh every 30 minutes. Price movements are source-derived momentum, not verified transaction volume.</p><a href="#card-valuer" className="market-action mt-3">Value a card</a></div>
          <RecentNotableSales cards={displayCards} />
        </div>

        {/* === SELL ON EBAY (affiliate, live TCG pricing) === */}
        <SellOnEbaySection />

        <MarketOverview />
        <SealedCategoryCharts />
        <section id="market-outlook" className="space-y-3" aria-labelledby="market-outlook-title">
          <h2 id="market-outlook-title" className="market-section-title">Forecasts and market coverage</h2>
          <ForecastLedger />
        <LazySection minHeight="100px">
          <MarketCapSummary liveRawCards={displayCards} />
        </LazySection>
          <details className="terminal-card p-4">
            <summary className="font-semibold">Daily prediction game</summary>
            <p className="market-note">Simulated predictions. Recorded forecast outcomes appear above.</p>
        <LazySection minHeight="200px">
          <PricePredictionGame cards={displayCards} />
        </LazySection>
          </details>
        </section>
        <CatalogExplorer />
        <LazySection minHeight="200px">
          <DailySpotlight cards={cardsWithImages.length > 0 ? cardsWithImages : displayCards} />
        </LazySection>
        <PokeHelp />

        <LazySection minHeight="280px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <TopMoversTable cards={displayCards} title="Top Movers — Raw Cards" isLoading={isLoading} />
            <TopMoversTable cards={displayGraded} title="Graded asking-price observations" isLoading={isLoading} />
          </div>
        </LazySection>

        <DatedMovers />





        <section className="space-y-3" aria-labelledby="market-guide-title">
        <h2 id="market-guide-title" className="market-section-title">Understand the market</h2>
        <details className="terminal-card p-4" open>
          <summary className="font-semibold">How to read these numbers</summary>
          <p className="text-sm mt-2">A source quote is a dated price for an exact printing or product. A graded asking median summarizes listed prices. Compare changes only across matching items and dates. A base-100 index shows change relative to its starting value.</p>
        </details>
        <LazySection minHeight="200px">
          <AIMarketInsights cards={displayCards} />
        </LazySection>

        <LazySection minHeight="180px">
          <section className="terminal-card p-4"><h2>Compare with other markets</h2><p className="text-muted-foreground text-sm">S&amp;P 500, Nasdaq, gold and Bitcoin comparisons need aligned historical observations. Verified comparisons are not connected yet.</p></section>
        </LazySection>

        <LazySection minHeight="150px">
          <MarketTrendSummary cards={displayCards} />
        </LazySection>

        <LazySection minHeight="180px">
          <MarketIntelWidget cards={displayCards} />
        </LazySection>
        </section>
        <section className="space-y-3" aria-labelledby="market-performance-title">
          <h2 id="market-performance-title" className="market-section-title">Market performance by era, set and sealed product</h2>

        <LazySection minHeight="150px">
          <EraIndexCards cards={displayCards} />
        </LazySection>

        <LazySection minHeight="200px">
          <SetHeatmap cards={displayCards} />
        </LazySection>

        <LazySection minHeight="220px">
          <SealedBoxHeatmap products={displaySealed} />
        </LazySection>
        </section>


        <h2 className="market-section-title">Explore cards & sets <span>Find your next card</span></h2>
        <TrendingCards cards={displayCards} isLoading={isLoading} />


        <LazySection minHeight="70px">
          <MarketUpdateBanner cards={displayCards} />
        </LazySection>

        <div ref={searchRef}>
          <a href="#card-valuer" className="market-action">Open the free card and product valuer ↑</a>
        </div>




        <LazySection minHeight="120px">
          <div className="terminal-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
                  🃏 Poké Ripz™
                </h2>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  Digital pack ripping — watch, bet, and rip across every era. Buy in with PokéCoins.
                </p>
              </div>
              <a
                href="/ripz"
                className="font-mono text-xs font-semibold bg-primary text-primary-foreground rounded px-4 py-1.5 hover:opacity-90"
              >
                RIP NOW →
              </a>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {["🏆 Vintage", "🔴 EX", "💠 DP/Plat", "⚫ BW/XY", "☀️ S&M/SwSh", "🔮 Modern"].map((era) => (
                <div key={era} className="terminal-card p-2 text-center">
                  <p className="text-lg">{era.split(" ")[0]}</p>
                  <p className="font-mono text-[8px] text-muted-foreground">
                    {era.split(" ").slice(1).join(" ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </LazySection>

        {/* === GRADING ROI CALCULATOR — ABOVE GAMES === */}
        <LazySection minHeight="210px">
          <details className="terminal-card p-4"><summary className="font-bold">Grading scenario calculator — modeled estimates</summary><p className="market-note">This tool uses assumed grade premiums and example service costs. Verify current grading fees directly; the output is not a market quote.</p><details className="terminal-card p-4"><summary className="font-bold">Grading scenario calculator — modeled estimates</summary><p className="market-note">This tool uses assumed grade premiums and example service costs. Verify current grading fees directly; the output is not a market quote.</p><GradingROICalculator cards={displayCards} /></details></details>
        </LazySection>

        <section id="poke-race" className="scroll-mt-20"><p className="market-note">Simulated entertainment — virtual coins, modeled movement, no real trading.</p><PokeRaceSection /></section>
        <GamePromo />

        <LazySection minHeight="70px">
          <TrustSignals />
        </LazySection>



        <details className="terminal-card research-previews p-4"><summary className="font-bold cursor-pointer">Research & simulator previews — experimental estimates</summary><p className="market-note">These older tools include modeled signals and simulated data. They are not verified sale histories, investment predictions, or measured returns.</p>
        <LazySection minHeight="280px">
          <ProGate feature="Historical price charts" blur>
            <div className="terminal-card p-4"><h3>Individual card history</h3><p className="text-sm text-muted-foreground">Verified per-card historical prices are not connected. The market charts above show stored observations; no random curve is substituted.</p></div>
          </ProGate>
        </LazySection>

        <LazySection minHeight="200px">
          <ProGate feature="Predictive Alpha Signals" blur>
            <AlphaSignals signals={alphaSignals} />
          </ProGate>
        </LazySection>

        <LazySection minHeight="200px">
          <ProGate feature="AI signal analysis" blur>
            <SignalSummary cards={displayCards} />
          </ProGate>
        </LazySection>

        <LazySection minHeight="220px">
          <ProGate feature="Pulse Score™ Analysis" blur>
            <PulseScore cards={displayCards} />
          </ProGate>
        </LazySection>

        <LazySection minHeight="220px">
          <ProGate feature="Correlation Matrix" blur>
            <CorrelationMatrix cards={displayCards} />
          </ProGate>
        </LazySection>

        <LazySection minHeight="220px">
          <ProGate feature="Pop Report Δ — Supply Pressure" blur>
            <PopReportDelta cards={displayCards} />
          </ProGate>
        </LazySection>



        <LazySection minHeight="200px">
          <ProGate feature="Grading Arbitrage Scanner" blur>
            <GradingArbitrage />
          </ProGate>
        </LazySection>

        <LazySection minHeight="200px">
          <ProGate feature="Grade Ratio Arbitrage Bot" blur>
            <GradeRatioArbitrageBot />
          </ProGate>
        </LazySection>

        <LazySection minHeight="200px">
          <ProGate feature="Alpha Signal Accuracy Metrics" blur>
            <AlphaAccuracy />
          </ProGate>
        </LazySection>

        <LazySection minHeight="200px">
          <InstitutionalGate feature="Real-Time Arbitrage Finder">
            <ArbitrageFinder />
          </InstitutionalGate>
        </LazySection>

        <LazySection minHeight="0px">
          <ProGate feature="JP → EN Precursor Tracker" blur>
            <JPtoENTracker />
          </ProGate>
        </LazySection>

        </details>
        <LazySection minHeight="0px">
          <ProGate feature="Full card board (500+ cards)" blur>
            <MarketTabs
              liveCards={displayCards}
              liveGradedCards={displayGraded}
              liveSealedProducts={displaySealed}
            />
          </ProGate>
        </LazySection>

        <LazySection minHeight="200px">
          <div className="terminal-card p-4"><h3>Collector portfolios</h3><p className="text-sm text-muted-foreground">Public verified performance rankings are not connected yet.</p></div>
        </LazySection>

        <LazySection minHeight="200px">
          <CardValuer id="card-valuer-lower" compact />
        </LazySection>

        <LazySection minHeight="100px">
          <PortalPreview />
        </LazySection>

        <LazySection minHeight="80px">
          <ImportFromTCGPlayer />
        </LazySection>









        {/* Pulse Philanthropic Project */}
        <section className="terminal-card border border-border rounded-lg p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏛️</span>
            <h2 className="font-mono text-sm font-bold tracking-tight text-foreground">
              Pulse Philanthropic Project™
            </h2>
            <span className="text-[8px] font-mono text-muted-foreground/60 border border-border/20 rounded px-1">TIER 5</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            <span className="text-primary font-semibold">The National Museum of Trading Cards & Collectibles</span> —
            Our long-term philanthropic vision powered by Poke-Pulse-Engine™ revenue. Every subscription,
            every trade, every signal contributes to building the world's first museum dedicated to preserving
            the cultural history of trading card games and collectibles for future generations.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { label: "Mission", value: "Preserve TCG History" },
              { label: "Funded By", value: "Engine Revenue" },
              { label: "Status", value: "Building Capital" },
            ].map(item => (
              <div key={item.label} className="text-center border border-border/10 rounded p-1.5">
                <p className="text-[8px] text-muted-foreground/60 font-mono">{item.label}</p>
                <p className="text-[10px] font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-muted-foreground/40 font-mono text-center">
            © PGVA Ventures, LLC · 501(c)(3) Pending
          </p>
        </section>

        <FinancialDisclaimer />

        <footer className="border-t border-border/30 pt-2 pb-6">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-[13px] tracking-tight text-foreground">
                Poke-Pulse-
              </span>
              <span className="font-display font-extrabold text-[11px] tracking-[0.06em] text-primary uppercase">
                Engine
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
              <a
                href="https://poke-pulse-ticker.lovable.app"
                className="text-[11px] text-primary font-semibold hover:underline transition-colors"
              >
                poke-pulse-ticker.lovable.app
              </a>
              <span className="text-border/50 hidden sm:inline">|</span>
              <span className="text-[10px] text-muted-foreground">Live Poké TCG Market Data</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
              {[
                { href: "/pokemon-kids", label: "Poké Adventure Land" },
                { href: "#poke-race", label: "Poké Race" },
                { href: "/arena", label: "Arena" },
                { href: "/videos", label: "Videos" },
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
                { href: "/legal-protection", label: "Legal & IP" },
                { href: "/methodology", label: "Methodology" },
                { href: "mailto:contact@poke-pulse-ticker.com", label: "Contact" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground/60 text-center max-w-md leading-snug">
              Poké is a trademark of Nintendo/Creatures Inc./GAME FREAK inc. Not affiliated with The Poké
              Company International. Catalog: TCGdex. Prices: TCGplayer via TCGCSV and graded asking medians from eBay. Not financial advice.
            </p>
            <p className="text-[10px] text-muted-foreground/50 font-mono">
              © {new Date().getFullYear()} PGVA Ventures, LLC. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {/* All popups removed per user request */}
      <a href="#poke-help" className="poke-floating-help">Ask Poke</a>
      <ShareButton />
    </div>
  );
};

export default Index;
