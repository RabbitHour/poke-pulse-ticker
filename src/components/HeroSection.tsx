import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, Layers, TrendingUp, Zap, ArrowRight, Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import heroCardFan from "@/assets/hero-card-fan.jpg";

const actions = [
  {
    icon: Search,
    label: "Price a Card",
    desc: "Live market value in seconds",
    action: "search",
  },
  {
    icon: Briefcase,
    label: "Track Portfolio",
    desc: "Real-time P&L on holdings",
    path: "/portfolio",
  },
  {
    icon: Layers,
    label: "Browse Sets",
    desc: "Compare every era & set",
    path: "/sets",
  },
  {
    icon: TrendingUp,
    label: "Start Pro Trial",
    desc: "14 days free · no card",
    path: "/pricing",
  },
];

interface HeroSectionProps {
  onSearchFocus?: () => void;
  topMoverName?: string;
  topMoverChange?: number;
  isLive?: boolean;
  cardCount?: number;
}

const HeroSection = ({ onSearchFocus, topMoverName, topMoverChange, isLive = false, cardCount = 0 }: HeroSectionProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "0%"] : ["-30%", "30%"]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [1, 1, 1] : [0.95, 1.05, 0.98]);

  const particleCount = isMobile ? 0 : 10;

  const hookLine =
    isLive && topMoverName && topMoverChange !== undefined
      ? `${topMoverName} just moved ${topMoverChange >= 0 ? "+" : ""}${topMoverChange.toFixed(1)}% — the market is moving right now.`
      : "Search standout cards, watch fresh prices, and enjoy a brighter Poké market view.";

  return (
    <motion.div
      ref={ref}
      initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0 } : { duration: 0.55, ease: "easeOut" }}
      className="terminal-card hero-glow-border overflow-hidden relative"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={isMobile ? undefined : { y: glowY, scale: glowScale }}
      >
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(160 84% 50% / 0.08), transparent)" }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(215 90% 62% / 0.06), transparent)" }}
        />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3) * 1.5}px`,
              height: `${2 + (i % 3) * 1.5}px`,
              left: `${8 + (i * 8) % 84}%`,
              top: `${10 + (i * 12) % 78}%`,
              background:
                i % 3 === 0
                  ? "hsl(var(--primary) / 0.4)"
                  : i % 3 === 1
                    ? "hsl(var(--terminal-blue) / 0.28)"
                    : "hsl(var(--terminal-amber) / 0.22)",
            }}
            animate={{
              y: [0, -16 - (i % 4) * 4, 0],
              x: [0, i % 2 === 0 ? 8 : -8, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.35,
            }}
          />
        ))}
      </div>

      <div className="relative px-5 py-7 sm:px-8 sm:py-9 border-b border-border/60">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.45 }}
              className="hidden sm:flex flex-col leading-none select-none shrink-0 mt-1"
            >
              <span
                className="font-display font-black text-[22px] md:text-[28px] tracking-tight text-foreground"
                style={{ textShadow: "0 0 10px hsl(210 25% 97% / 0.5)" }}
              >
                Poke-Pulse-
              </span>
              <span
                className="font-display font-extrabold text-[18px] md:text-[22px] tracking-[0.04em] text-primary uppercase"
                style={{ textShadow: "0 0 12px hsl(158 72% 46% / 0.4)" }}
              >
                Engine™
              </span>
            </motion.div>

            <div className="space-y-3 flex-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1"
              >
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono text-[10px] font-bold tracking-wider text-primary uppercase">Live Poké Market Terminal</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24, duration: 0.45 }}
                className="font-display text-xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              >
                Know what your cards are worth.{" "}
                <span className="text-primary">Right now.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32, duration: 0.45 }}
                className="text-sm sm:text-base text-secondary font-semibold"
              >
                {hookLine}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38, duration: 0.45 }}
                className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed"
              >
                The <span className="text-foreground font-medium">Poke-Pulse-Engine™</span> helps collectors scan
                standout cards, follow momentum, and move from discovery to action with a cleaner market view.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.45 }}
                className="relative overflow-hidden rounded-lg border border-primary/20 bg-muted/20 lg:hidden"
              >
                <img
                  src={heroCardFan}
                  alt="A bright spread of collectible cards glowing on a tabletop"
                  className="h-full w-full object-cover"
                  width={1024}
                  height={1280}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/35 to-transparent p-4">
                  <p className="font-display text-lg font-extrabold text-foreground">Big cards. Bold moves.</p>
                  <p className="text-xs text-muted-foreground">From grails to daily movers, the market feels alive again.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.45 }}
                className="flex flex-wrap gap-3 pt-1"
              >
                <button
                  onClick={onSearchFocus}
                  className="group relative inline-flex items-center gap-2 px-7 py-3 sm:py-2.5 rounded-lg font-mono text-sm font-bold text-primary-foreground hover:shadow-[0_0_30px_hsl(158_72%_46%/0.3)] transition-all duration-300 overflow-hidden min-h-[48px] shadow-[0_2px_12px_hsl(158_72%_46%/0.15)]"
                  style={{ background: "hsl(158, 72%, 46%)" }}
                >
                  <div className="absolute inset-0 shimmer-sweep opacity-40" />
                  <Search className="relative w-4 h-4" />
                  <span className="relative">PRICE A CARD — FREE</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate("/pricing")}
                  className="inline-flex items-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg font-mono text-sm font-medium border border-primary/30 text-foreground hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 min-h-[48px]"
                >
                  <Zap className="w-4 h-4 text-primary" />
                  Start 14-Day Pro Trial
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.54 }}
                className="font-mono text-[10px] text-primary/70 tracking-wide"
              >
                {isLive
                  ? `✓ No credit card · ✓ Cancel anytime · ✓ ${cardCount.toLocaleString("en-US")} cards loaded`
                  : `✓ Search free · ✓ Explore standout cards · ✓ ${cardCount.toLocaleString("en-US")} cards loaded`}
              </motion.p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 lg:flex-col lg:w-full lg:max-w-[320px]">
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.28, type: "spring", stiffness: 190 }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg border border-primary/20 bg-primary/5"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-primary pulse-live" />
              <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">Live</span>
            </motion.div>

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.45 }}
              className="relative hidden w-full overflow-hidden rounded-lg border border-primary/20 bg-muted/20 lg:block"
            >
              <img
                src={heroCardFan}
                alt="A bright spread of collectible cards glowing on a tabletop"
                className="h-full w-full object-cover"
                width={1024}
                height={1280}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/35 to-transparent p-4">
                <p className="font-display text-2xl font-extrabold text-foreground">Big cards. Bold moves.</p>
                <p className="mt-1 text-sm text-muted-foreground">A brighter first look for collectors, flippers, and Poké market watchers.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/60">
        {actions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + idx * 0.08, duration: 0.35 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (item.action === "search") onSearchFocus?.();
                else if (item.path) navigate(item.path);
              }}
              className="relative flex flex-col items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-4 sm:py-5 transition-colors group cursor-pointer hover:bg-muted/30 overflow-hidden min-h-[72px] sm:min-h-0"
            >
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 shimmer-sweep" />
              </div>
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/15 group-hover:shadow-[0_0_20px_hsl(160_84%_50%/0.15)] transition-all duration-300 overflow-hidden">
                <Icon className="relative w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="text-center">
                <span className="text-xs sm:text-sm font-semibold text-foreground block">{item.label}</span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug hidden sm:block mt-1">
                  {item.desc}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default HeroSection;
