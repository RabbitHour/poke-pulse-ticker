import { useAuth } from "@/contexts/AuthContext";
import { Lock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface InstitutionalGateProps {
  children: React.ReactNode;
  feature?: string;
}

/**
 * Gates content to Institutional tiers only (Premium, Team, Whale).
 * Pro tier does NOT get access — this is a hard upgrade ceiling.
 */
const InstitutionalGate = ({ children, feature = "This feature" }: InstitutionalGateProps) => {
  const { user, subscribed, tier } = useAuth();
  const OWNER_EMAIL = "pokegarageva@gmail.com";

  const isInstitutional = subscribed && (tier === "premium" || tier === "team" || tier === "whale");
  const isOwner = user?.email === OWNER_EMAIL;

  // Global unlock: all features are free until tier gating is re-enabled.
  if (!GATES_ENABLED || isInstitutional || isOwner) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="terminal-card border-primary/40 bg-background/95 backdrop-blur-sm p-6 text-center max-w-sm mx-auto">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="font-mono text-sm font-bold text-foreground mb-1">
            Institutional Access Only
          </h3>
          <p className="font-mono text-[10px] text-muted-foreground mb-3">
            {feature} requires Premium ($9.99/mo), Team ($19.99/mo), or Whale ($49.99/mo) tier.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-primary text-primary-foreground rounded px-5 py-2 hover:opacity-90 transition-opacity"
          >
            <Lock className="w-3 h-3" /> Upgrade to Institutional
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalGate;
