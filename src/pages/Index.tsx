import { useRef, useEffect, useMemo, useState } from "react";

import { rawCards, gradedCards, sealedProducts, getIndexValue, getIndexChange } from "@/data/marketData";
import { useLiveCards } from "@/hooks/usePokemonTcg";
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

import PromoStack from "@/components/PromoStack";
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
import SimTraderPromo from "@/components/SimTraderPromo";
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
        title: "Subscription activated!",
        description: "Welcome to Pro. Refreshing your status...",
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

  const displayCards = liveCards && liveCards.length > 0 ? liveCards : fallbackRawCards;
  const liveGradedCards = useGradedCards(liveCards);
  const displayGraded = liveGradedCards.length > 0 ? liveGradedCards : fallbackGradedCards;
  const liveSealedProducts = useSealedProducts(liveCards);
  const displaySealed = liveSealedProducts.length > 0 ? liveSealedProducts : fallbackSealedProducts;
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
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const input = searchRef.current?.querySelector("input");
      input?.focus();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* StickyUpgradeBanner removed — popups disabled */}
      <TerminalHeader />
      <TickerBar
        cards={displayCards}
        isLive={isLive}
        lastUpdated={isLive ? (dataUpdatedAt || Date.now()) : undefined}
      />

      {/* Bioluminescent veil quick-link */}
      <a
        href="/bioluminescent"
        className="block w-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-violet-300 text-slate-900 text-center text-xs sm:text-sm font-semibold py-2 px-3 hover:brightness-110 transition"
      >
        ✨ Open the Bioluminescent veil → AI Builder + Government Contracting Master Kit
      </a>

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 lg:px-6 py-2 sm:py-4 space-y-2.5 sm:space-y-3"
      >
        <HeroSection
          onSearchFocus={handleSearchFocus}
          topMoverName={topMover?.name}
          topMoverChange={topMover?.change}
          isLive={isLive}
          cardCount={displayCards.length}
        />

        <SocialProofBar
          totalMarketValue={totalMarketValue}
          isLive={isLive}
          lastUpdated={isLive ? (dataUpdatedAt || Date.now()) : undefined}
          cardCount={displayCards.length}
        />

        {/* === PULSE ENGINE WALLET — PRO USERS ONLY === */}
        <PulseWalletWidget />

        {/* === EBAY LIVE DEALS — MOVED UP for buy intent === */}
        <LazySection minHeight="200px">
          <EbayLiveDeals />
        </LazySection>

        {/* === MARKET PULSE + NOTABLE SALES === */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          <LiveMarketPulse cards={displayCards} />
          <RecentNotableSales cards={displayCards} />
        </div>

        {/* === SELL ON EBAY (affiliate, live TCG pricing) === */}
        <SellOnEbaySection />

        {/* === MARKET INDEXES === */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <SkeletonIndexCard />
            <SkeletonIndexCard />
            <SkeletonIndexCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <MarketIndexCard
              title="RAW 1000 INDEX"
              value={rawIndex}
              change={rawChange}
              count={1000}
              description="1,000+ raw cards — live TCGPlayer pricing"
              variant="green"
            />
            <MarketIndexCard
              title="GRADED 1000 INDEX"
              value={gradedIndex}
              change={gradedChange}
              count={1000}
              description="1,000+ graded cards (PSA/CGC/BGS/TAG)"
              variant="amber"
            />
            <MarketIndexCard
              title="SEALED 1000 INDEX"
              value={sealedIndex}
              change={sealedChange}
              count={1000}
              description="1,000+ sealed products (Boxes/Packs/ETBs)"
              variant="blue"
            />
          </div>
        )}

        {(() => {
          const isNYSE = marketOpen;
          return (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <IndexDayChart
                  title="RAW 1000 INDEX"
                  indexValue={rawIndex}
                  indexChange={rawChange}
                  variant="green"
                  refreshKey={chartRefreshKey}
                />
                <IndexDayChart
                  title="GRADED 1000 INDEX"
                  indexValue={gradedIndex}
                  indexChange={gradedChange}
                  variant="amber"
                  refreshKey={chartRefreshKey}
                />
                <IndexDayChart
                  title="SEALED 1000 INDEX"
                  indexValue={sealedIndex}
                  indexChange={sealedChange}
                  variant="blue"
                  refreshKey={chartRefreshKey}
                />
              </div>
            </div>
          );
        })()}

        <LazySection minHeight="280px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <TopMoversTable cards={displayCards} title="Top Movers — Raw Cards" isLoading={isLoading} />
            <TopMoversTable cards={displayGraded} title="Top Movers — Graded Cards" isLoading={isLoading} />
          </div>
        </LazySection>


        <LazySection minHeight="200px">
          <AIMarketInsights cards={displayCards} />
        </LazySection>

        <LazySection minHeight="180px">
          <MacroCorrelation />
        </LazySection>

        <LazySection minHeight="150px">
          <MarketTrendSummary cards={displayCards} />
        </LazySection>

        <LazySection minHeight="180px">
          <MarketIntelWidget cards={displayCards} />
        </LazySection>

        <LazySection minHeight="150px">
          <EraIndexCards cards={displayCards} />
        </LazySection>

        <LazySection minHeight="200px">
          <SetHeatmap cards={displayCards} />
        </LazySection>

        <LazySection minHeight="220px">
          <SealedBoxHeatmap products={displaySealed} />
        </LazySection>

        <LazySection minHeight="200px">
          <DailySpotlight cards={cardsWithImages.length > 0 ? cardsWithImages : displayCards} />
        </LazySection>

        <TrendingCards cards={displayCards} isLoading={isLoading} />

        <LazySection minHeight="100px">
          <MarketCapSummary liveRawCards={displayCards} />
        </LazySection>

        <LazySection minHeight="70px">
          <MarketUpdateBanner cards={displayCards} />
        </LazySection>

        <div ref={searchRef}>
          <LazySection minHeight="100px">
            <CardSearch />
          </LazySection>
        </div>

        <LazySection minHeight="200px">
          <PricePredictionGame cards={displayCards} />
        </LazySection>

        <InlineUpgradeNudge variant="savings" />

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
          <GradingROICalculator cards={displayCards} />
        </LazySection>

        <PokeRaceSection />
        <GamePromo />
        <SimTraderPromo />

        <LazySection minHeight="70px">
          <TrustSignals />
        </LazySection>

        <div className="relative">
          <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        </div>

        <LazySection minHeight="280px">
          <ProGate feature="Historical price charts" blur>
            <PriceChart cards={displayCards} />
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

        <InlineUpgradeNudge variant="trust" />

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
          <VerifiedLeaderboard />
        </LazySection>

        <LazySection minHeight="200px">
          <WhaleReport cards={displayCards} />
        </LazySection>

        <LazySection minHeight="100px">
          <ValueUnlockPreview />
        </LazySection>

        <PromoStack />

        <LazySection minHeight="80px">
          <ImportFromTCGPlayer />
        </LazySection>

        <InlineUpgradeNudge variant="default" />

        <LazySection minHeight="280px">
          <SubscriptionTiers />
        </LazySection>

        <LazySection minHeight="90px">
          <TeamPlanCTA />
        </LazySection>

        <LazySection minHeight="70px">
          <ReferralCTA />
        </LazySection>

        {/* Pulse Philanthropic Project */}
        <section className="border border-border/[0.08] rounded-lg p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
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
            © PGVA Ventures, LLC · Noyes Family Trust · 501(c)(3) Pending
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
              Company International. Data powered by pokemontcg.io. Not financial advice.
            </p>
            <p className="text-[10px] text-muted-foreground/50 font-mono">
              © {new Date().getFullYear()} PGVA Ventures, LLC. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {/* All popups removed per user request */}
      <ShareButton />
    </div>
  );
};

export default Index;
