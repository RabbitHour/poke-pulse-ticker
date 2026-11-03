import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

interface MarketIndexCardProps {
  title: string;
  value: number;
  change: number;
  count: number;
  description: string;
  variant?: "green" | "amber" | "blue";
}

const MarketIndexCard = ({
  title,
  value,
  change,
  count,
  description,
  variant = "green",
}: MarketIndexCardProps) => {
  const accentClass =
    variant === "green"
      ? "text-terminal-green border-t-terminal-green"
      : variant === "amber"
        ? "text-terminal-amber border-t-terminal-amber"
        : "text-terminal-blue border-t-terminal-blue";

  const glowColor =
    variant === "green"
      ? "0 8px 30px hsl(145 100% 45% / 0.08)"
      : variant === "amber"
        ? "0 8px 30px hsl(40 100% 55% / 0.08)"
        : "0 8px 30px hsl(210 100% 60% / 0.08)";

  const isUp = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{
        scale: 1.015,
        boxShadow: glowColor,
      }}
      className={`terminal-card hero-glow-border p-5 border-t-2 transition-shadow duration-300 ${accentClass}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          {title}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {count.toLocaleString()} tracked
        </span>
      </div>

      <div className="text-2xl lg:text-3xl font-extrabold text-foreground mb-1.5 font-display">
        ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <p className="text-xs text-muted-foreground/80 mb-3">{description}</p>

      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-sm font-semibold flex items-center gap-1 ${
            isUp ? "text-terminal-green" : "text-terminal-red"
          }`}
        >
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isUp ? "+" : ""}
          {Math.abs(change).toFixed(2)}%
        </span>

        <Link
          to="/methodology"
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono"
        >
          <Info className="w-3 h-3" />
          Methodology
        </Link>
      </div>
    </motion.div>
  );
};

export default MarketIndexCard;
