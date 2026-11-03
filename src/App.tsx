import CatalogRecord from "./pages/CatalogRecord";
import FreeAccount from "./pages/FreeAccount";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { useCopyProtection } from "@/hooks/useCopyProtection";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import Watermark from "@/components/Watermark";
import CopyrightBanner from "@/components/CopyrightBanner";
// CookieConsent removed — popups disabled except install prompt
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index.tsx";
import CardDetail from "./pages/CardDetail.tsx";
import SetBrowser from "./pages/SetBrowser.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Guides from "./pages/Guides.tsx";
import CommandCenter from "./pages/CommandCenter.tsx";
import ReleaseCalendar from "./pages/ReleaseCalendar.tsx";
import Watchlist from "./pages/Watchlist.tsx";
import Contact from "./pages/Contact.tsx";
import PriceAlerts from "./pages/PriceAlerts.tsx";
import SetCompletion from "./pages/SetCompletion.tsx";
import ProfilePage from "./pages/Profile.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import NotFound from "./pages/NotFound.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import BlogEditor from "./pages/BlogEditor.tsx";
import TradeCalculator from "./pages/TradeCalculator.tsx";
import Pricing from "./pages/Pricing.tsx";
import Methodology from "./pages/Methodology.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import AccessibleLanding from "./pages/AccessibleLanding.tsx";
import SocialLanding from "./pages/SocialLanding.tsx";
import SimTrader from "./pages/SimTrader.tsx";
import PromoAssets from "./pages/PromoAssets.tsx";
import VideoLibrary from "./pages/VideoLibrary.tsx";
import Arena from "./pages/Arena.tsx";
import CapitalCampaign from "./pages/CapitalCampaign.tsx";
import CapitalDreamIntake from "./pages/CapitalDreamIntake.tsx";
import PokemonKidsGame from "./pages/PokemonKidsGame.tsx";
import Franchise from "./pages/Franchise.tsx";
import Blueprint from "./pages/Blueprint.tsx";
import Donate from "./pages/Donate.tsx";
import PokeRipz from "./pages/PokeRipz.tsx";
import PulseWallet from "./pages/PulseWallet.tsx";
import LegalProtection from "./pages/LegalProtection.tsx";
import MLBDemo from "./pages/demos/MLBDemo.tsx";
import NFLDemo from "./pages/demos/NFLDemo.tsx";
import NBADemo from "./pages/demos/NBADemo.tsx";
import NHLDemo from "./pages/demos/NHLDemo.tsx";
import FIFADemo from "./pages/demos/FIFADemo.tsx";
import MTGDemo from "./pages/demos/MTGDemo.tsx";
import YuGiOhDemo from "./pages/demos/YuGiOhDemo.tsx";
import DBZDemo from "./pages/demos/DBZDemo.tsx";
import LorcanaDemo from "./pages/demos/LorcanaDemo.tsx";
import StarWarsDemo from "./pages/demos/StarWarsDemo.tsx";
import Welcome from "./pages/Welcome.tsx";
import Boardroom from "./pages/Boardroom.tsx";
import Bioluminescent from "./pages/Bioluminescent.tsx";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/catalog/:id" element={<CatalogRecord />} />
          <Route path="/account" element={<FreeAccount />} />
          <Route path="/index" element={<Index />} />
          <Route path="/card/:slug" element={<CardDetail />} />
          <Route path="/sets" element={<SetBrowser />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/releases" element={<ReleaseCalendar />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/alerts" element={<PriceAlerts />} />
          <Route path="/set-completion" element={<SetCompletion />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog-editor" element={<BlogEditor />} />
          <Route path="/trade" element={<TradeCalculator />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/accessible" element={<AccessibleLanding />} />
          <Route path="/go" element={<SocialLanding />} />
          <Route path="/sim-trader" element={<SimTrader />} />
          <Route path="/promo" element={<PromoAssets />} />
          <Route path="/videos" element={<VideoLibrary />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/capital-campaign" element={<CapitalCampaign />} />
          <Route path="/capital-dream" element={<CapitalDreamIntake />} />
          <Route path="/pokemon-kids" element={<PokemonKidsGame />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/ripz" element={<PokeRipz />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/pulse-wallet" element={<PulseWallet />} />
          <Route path="/legal-protection" element={<LegalProtection />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/boardroom" element={<Boardroom />} />
          <Route path="/bioluminescent" element={<Bioluminescent />} />
          <Route path="/bioluminescent/:threadId" element={<Bioluminescent />} />
          <Route path="/demo/mlb" element={<MLBDemo />} />
          <Route path="/demo/nfl" element={<NFLDemo />} />
          <Route path="/demo/nba" element={<NBADemo />} />
          <Route path="/demo/nhl" element={<NHLDemo />} />
          <Route path="/demo/fifa" element={<FIFADemo />} />
          <Route path="/demo/mtg" element={<MTGDemo />} />
          <Route path="/demo/yugioh" element={<YuGiOhDemo />} />
          <Route path="/demo/dbz" element={<DBZDemo />} />
          <Route path="/demo/lorcana" element={<LorcanaDemo />} />
          <Route path="/demo/starwars" element={<StarWarsDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  useCopyProtection();
  useSessionTimeout();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Watermark />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AccessibilityProvider>
            <AnimatedRoutes />
            <CopyrightBanner />
            {/* Popups removed except InstallPrompt */}
          </AccessibilityProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
