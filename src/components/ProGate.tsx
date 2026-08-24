import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe";
import { Lock, Zap, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { motion } from "framer-motion";
import { GATES_ENABLED } from "@/lib/featureGates";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
  /** If true, show blurred preview instead of full lock */
  blur?: boolean;
}

const ProGate = ({ children, feature = "This feature", blur = false }: ProGateProps) => {
  const { user, loading: authLoading, subscribed, tier } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const isPro = subscribed && (tier === "pro" || tier === "premium" || tier === "team" || tier === "whale");

  // Authenticated + subscribed/trial → full access
  if (user && isPro) return <>{children}</>;

  // Still loading auth state → show skeleton
  if (authLoading) {
    return (
      <div className="terminal-card p-8 flex items-center justify-center">
        <div className="animate-pulse font-mono text-xs text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // NOT authenticated → require sign-in first (hard gate)
  if (!user) {
    return (
      <div className="relative">
        {blur ? (
          <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
        ) : null}
        <div className={`${blur ? "absolute inset-0 flex items-center justify-center" : ""}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="terminal-card border-primary/30 bg-background/95 backdrop-blur-sm p-6 text-center max-w-md mx-auto"
          >
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h3 className="font-mono text-sm font-bold text-foreground mb-1">
              🔐 Sign In Required
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {feature} requires an account. Sign in or create one to get a <span className="text-primary font-bold">14-day free Pro trial</span>.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="group relative w-full py-3 rounded-lg font-mono text-sm font-bold bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(160_84%_50%/0.3)] transition-all flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 shimmer-sweep opacity-50" />
              <Zap className="relative h-4 w-4" />
              <span className="relative">Sign In / Create Account</span>
            </button>
            <p className="font-mono text-[10px] text-muted-foreground mt-2">
              Free account includes 14-day Pro trial · No credit card needed
            </p>
          </motion.div>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  // Authenticated but NOT subscribed/trial → upgrade prompt
  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_TIERS.pro.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      // silently fail
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="relative">
      {blur ? (
        <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
      ) : null}
      <div className={`${blur ? "absolute inset-0 flex items-center justify-center" : ""}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="terminal-card border-primary/30 bg-background/95 backdrop-blur-sm p-6 text-center max-w-md mx-auto"
        >
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <Lock className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="font-mono text-sm font-bold text-foreground mb-1">
            🔒 PRO Feature — Unlock Now
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {feature} requires a Pro subscription.
          </p>

          <div className="flex flex-col gap-1.5 mb-4 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="font-mono text-[11px] text-foreground">Full price history & charts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="font-mono text-[11px] text-foreground">AI signal analysis & alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="font-mono text-[11px] text-foreground">500+ card board access</span>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="group relative w-full py-3 rounded-lg font-mono text-sm font-bold bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(160_84%_50%/0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 shimmer-sweep opacity-50" />
            <Zap className="relative h-4 w-4" />
            <span className="relative">{checkoutLoading ? "Loading..." : "Upgrade to Pro"}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <Clock className="w-3 h-3 text-primary/60" />
            <span className="font-mono text-[10px] text-primary/70">
              From $4.99/mo · Cancel anytime
            </span>
          </div>

          <a
            href="/pricing"
            className="block text-center font-mono text-[10px] text-primary hover:underline mt-2"
          >
            Compare all plans →
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ProGate;
