import { motion } from "framer-motion";
import { Star, Quote, Users } from "lucide-react";

const testimonials = [
  {
    name: "Jake M.",
    role: "Collector & Investor",
    quote: "Poke-Pulse-Engine changed how I buy cards. The 30-day MA signals saved me from overpaying on multiple occasions.",
    rating: 5,
    verified: true,
  },
  {
    name: "Sarah T.",
    role: "TCG Shop Owner",
    quote: "The sealed product index alone is worth the Pro sub. I price my inventory based on the live data here — it's that reliable.",
    rating: 5,
    verified: true,
  },
  {
    name: "Mike R.",
    role: "Graded Card Trader",
    quote: "Finally a platform that tracks graded, raw, AND sealed in one place. The AI signal analysis is a game-changer for timing buys.",
    rating: 5,
    verified: true,
  },
  {
    name: "Alex K.",
    role: "Casual Collector",
    quote: "Even the free tier gives me more data than any other Poké market tracker I've tried. Upgraded to Pro in a week.",
    rating: 4,
    verified: true,
  },
];

const Testimonials = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="terminal-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
            <Quote className="w-3.5 h-3.5" /> What Collectors Say
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            <Users className="w-3 h-3 text-primary" />
            <span className="font-mono text-[10px] text-primary font-semibold">2,400+ USERS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-4 space-y-3 hover:bg-muted/30 transition-colors duration-300"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < t.rating ? "text-terminal-amber fill-terminal-amber" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-foreground leading-relaxed italic">
                "{t.quote}"
              </p>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-mono text-[11px] font-semibold text-foreground">{t.name}</p>
                  {t.verified && (
                    <span className="font-mono text-[7px] px-1 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold tracking-wider">✓ VERIFIED</span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
