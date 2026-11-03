import { Shield, Lock } from "lucide-react";

const CopyrightBanner = () => {
  return (
    <div data-demo-hide className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-2 py-0.5 flex items-center justify-center gap-1">
        <Lock className="w-2 h-2 text-primary flex-shrink-0" />
        <p className="font-mono text-[5px] sm:text-[6px] text-muted-foreground tracking-wide leading-none">
          © {new Date().getFullYear()} PGVA Ventures, LLC · All Rights Reserved · Not Financial Advice · Pokémon™ Nintendo/Creatures/GAME FREAK
        </p>
        <Shield className="w-2 h-2 text-primary/60 flex-shrink-0" />
      </div>
    </div>
  );
};

export default CopyrightBanner;
