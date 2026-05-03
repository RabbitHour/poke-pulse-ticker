import { useAuth } from "@/contexts/AuthContext";
import { Lock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

const OWNER_EMAIL = "pokegarageva@gmail.com";

/**
 * TOP-SECRET hard gate. Only David Noyes (owner email) may view children.
 * Everything inside is classified — Federal/Empire/Delta Pod material.
 * Renders zero sensitive content to non-owners (no blur leak).
 */
const OwnerOnlyGate = ({ children, label = "TOP SECRET" }: { children: React.ReactNode; label?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.email === OWNER_EMAIL) return <>{children}</>;
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="terminal-card border-destructive/40 bg-background/95 p-6 text-center max-w-sm">
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center ring-2 ring-destructive/30">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-destructive mb-1">{label}</p>
        <h3 className="font-mono text-sm font-bold mb-2">Classified — Owner Eyes Only</h3>
        <p className="font-mono text-[10px] text-muted-foreground mb-3">
          Access restricted under 18 U.S.C. § 1832 and PGVA Ventures, LLC trade-secret protocol.
          Unauthorized attempts are logged.
        </p>
        <Link to="/" className="inline-flex items-center gap-1.5 font-mono text-xs bg-primary text-primary-foreground rounded px-4 py-2">
          <Lock className="w-3 h-3" /> Return
        </Link>
      </div>
    </div>
  );
};

export default OwnerOnlyGate;
