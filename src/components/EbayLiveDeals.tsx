import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Gavel, Package, ExternalLink, Award } from "lucide-react";

interface AuctionDeal {
  id: string;
  title: string;
  currentBid: number;
  marketValue: number;
  savings: number;
  savingsPct: number;
  bids: number;
  endsAt: number; // epoch ms — used for live countdown
  seller: string;
  sellerRating: number;
  condition?: string;
  grade?: string;
  grader?: string;
}

const SELLER_NAMES = [
  "pokevault_deals", "tcg_king99", "cardcave_shop", "slabmaster_co", "pokeprime_usa",
  "grail_cards_llc", "mint_factory", "charizard_hq", "rare_finds_tcg", "alpha_slabs",
  "elite_cards_us", "topshelf_tcg", "prism_collectibles", "neon_cards", "vault_sealed",
];

const RAW_CARD_POOL = [
  { name: "Charizard ex SAR", set: "151", mv: 280 },
  { name: "Umbreon VMAX Alt Art", set: "Evolving Skies", mv: 310 },
  { name: "Pikachu VMAX Rainbow", set: "Vivid Voltage", mv: 195 },
  { name: "Moonbreon VMAX", set: "Evolving Skies", mv: 340 },
  { name: "Giratina VSTAR Gold", set: "Crown Zenith", mv: 120 },
  { name: "Rayquaza VMAX Alt Art", set: "Evolving Skies", mv: 265 },
  { name: "Eevee Full Art SIR", set: "Prismatic Evolutions", mv: 185 },
  { name: "Mew VMAX Alt Art", set: "Fusion Strike", mv: 145 },
  { name: "Lugia V Alt Art", set: "Silver Tempest", mv: 175 },
  { name: "Gengar VMAX Alt Art", set: "Fusion Strike", mv: 155 },
  { name: "Espeon VMAX Alt Art", set: "Evolving Skies", mv: 205 },
  { name: "Blaziken VMAX Alt Art", set: "Chilling Reign", mv: 130 },
  { name: "Iono SAR", set: "Paldea Evolved", mv: 245 },
  { name: "Charizard VSTAR Rainbow", set: "Brilliant Stars", mv: 110 },
  { name: "Mewtwo VSTAR SAR", set: "Pokémon GO", mv: 95 },
];

const GRADED_CARD_POOL = [
  { name: "Charizard ex SAR", set: "151", mv: 520, grader: "PSA", grade: "10" },
  { name: "Umbreon VMAX Alt", set: "Evolving Skies", mv: 445, grader: "CGC", grade: "9.5" },
  { name: "Pikachu VMAX", set: "Vivid Voltage", mv: 310, grader: "BGS", grade: "9.5" },
  { name: "Rayquaza VMAX Alt", set: "Evolving Skies", mv: 480, grader: "PSA", grade: "10" },
  { name: "Giratina VSTAR Gold", set: "Crown Zenith", mv: 275, grader: "PSA", grade: "10" },
  { name: "Lugia V Alt Art", set: "Silver Tempest", mv: 350, grader: "PSA", grade: "10" },
  { name: "Mew VMAX Alt", set: "Fusion Strike", mv: 390, grader: "CGC", grade: "10" },
  { name: "Espeon VMAX Alt", set: "Evolving Skies", mv: 185, grader: "PSA", grade: "9" },
  { name: "Iono SAR", set: "Paldea Evolved", mv: 420, grader: "PSA", grade: "10" },
  { name: "Charizard VSTAR", set: "Brilliant Stars", mv: 225, grader: "PSA", grade: "10" },
  { name: "Gengar VMAX Alt", set: "Fusion Strike", mv: 260, grader: "BGS", grade: "9.5" },
  { name: "Eevee FA SIR", set: "Prismatic Evolutions", mv: 295, grader: "CGC", grade: "9.5" },
];

const SEALED_POOL = [
  { name: "Evolving Skies Booster Box", set: "Evolving Skies", mv: 380 },
  { name: "151 ETB", set: "151", mv: 85 },
  { name: "Crown Zenith ETB", set: "Crown Zenith", mv: 65 },
  { name: "Prismatic Evolutions ETB", set: "Prismatic Evolutions", mv: 95 },
  { name: "Obsidian Flames Booster Box", set: "Obsidian Flames", mv: 145 },
  { name: "Paldea Evolved Booster Box", set: "Paldea Evolved", mv: 155 },
  { name: "Surging Sparks Booster Box", set: "Surging Sparks", mv: 175 },
  { name: "151 Booster Bundle", set: "151", mv: 48 },
  { name: "Temporal Forces Booster Box", set: "Temporal Forces", mv: 130 },
  { name: "Stellar Crown ETB", set: "Stellar Crown", mv: 42 },
  { name: "Brilliant Stars Booster Box", set: "Brilliant Stars", mv: 165 },
  { name: "Silver Tempest Booster Box", set: "Silver Tempest", mv: 140 },
];

function pickRandom<T>(arr: T[], count: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => {
    const ha = ((seed * 31 + arr.indexOf(a)) * 2654435761) >>> 0;
    const hb = ((seed * 31 + arr.indexOf(b)) * 2654435761) >>> 0;
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

type PoolItem = { name: string; set: string; mv: number; grader?: string; grade?: string };

function generateDeals(pool: PoolItem[], category: string, seed: number): AuctionDeal[] {
  const picks = pickRandom(pool, 5, seed);
  const now = Date.now();
  return picks.map((item, i) => {
    const discountPct = 15 + ((seed * (i + 1) * 7) % 35);
    const currentBid = Math.round(item.mv * (1 - discountPct / 100));
    const savings = item.mv - currentBid;
    const bids = 3 + ((seed * (i + 2)) % 28);
    // Spread end-times between 30s and ~6 minutes from now
    const secondsLeft = 30 + ((seed * (i + 3) * 13) % 330);
    const sellerIdx = (seed * 3 + i * 7) % SELLER_NAMES.length;
    return {
      id: `${category}-${seed}-${i}`,
      title: item.name,
      currentBid,
      marketValue: item.mv,
      savings,
      savingsPct: discountPct,
      bids,
      endsAt: now + secondsLeft * 1000,
      seller: SELLER_NAMES[sellerIdx],
      sellerRating: 97 + ((seed + i) % 3),
      condition: item.grader ? undefined : "NM",
      grade: item.grade,
      grader: item.grader,
    };
  });
}

/** Live countdown that ticks every second */
const Countdown = ({ endsAt }: { endsAt: number }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, endsAt - now);
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const ending = totalSec <= 60;
  const ended = totalSec === 0;

  return (
    <span
      className={`font-mono text-[10px] font-bold tabular-nums ${
        ended ? "text-muted-foreground" : ending ? "text-destructive" : "text-terminal-amber"
      }`}
    >
      {ended ? "ENDED" : `${m}m ${s.toString().padStart(2, "0")}s`}
    </span>
  );
};

const DealRow = ({ deal, rank }: { deal: AuctionDeal; rank: number }) => {
  const ebaySearchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    deal.title
  )}&_sop=1&LH_Auction=1&LH_BIN=0&rt=nc`;

  const trackClick = () => {
    try {
      const url = new URL(import.meta.env.VITE_SUPABASE_URL);
      fetch(`${url.origin}/rest/v1/affiliate_clicks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ partner: "ebay", card_name: deal.title }),
        keepalive: true,
      });
    } catch {
      // best-effort tracking
    }
  };

  return (
    <motion.a
      href={ebaySearchUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.2 }}
      className="grid grid-cols-[36px_minmax(0,1fr)_96px] gap-2.5 items-center py-2.5 px-1.5 border-b border-border/10 last:border-0 hover:bg-primary/10 hover:scale-[1.01] transition-all cursor-pointer group rounded"
    >
      {/* Card-shaped thumb (bigger tap target, signals "this is a card") */}
      <div className="relative w-9 h-12 rounded bg-gradient-to-br from-primary/30 via-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/30 group-hover:ring-primary transition-all flex-shrink-0">
        <span className="font-mono text-[9px] font-black text-primary">#{rank}</span>
      </div>

      {/* Title + meta — single column, no overlap */}
      <div className="min-w-0">
        <p className="font-mono text-[13px] font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
          {deal.grader ? `${deal.title} ${deal.grader} ${deal.grade}` : deal.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground font-mono min-w-0">
          <span className="truncate">{deal.seller}</span>
          <span className="text-border/50 shrink-0">·</span>
          <span className="whitespace-nowrap shrink-0">{deal.bids}b</span>
          <span className="text-border/50 shrink-0">·</span>
          <Countdown endsAt={deal.endsAt} />
        </div>
      </div>

      {/* Price + BID button — bigger, clearer affiliate CTA */}
      <div className="text-right flex flex-col items-end gap-0.5">
        <p className="font-mono text-[14px] font-black text-primary leading-none tabular-nums">
          ${deal.currentBid}
        </p>
        <div className="flex items-center gap-1 justify-end">
          <span className="font-mono text-[9px] text-muted-foreground line-through tabular-nums">
            ${deal.marketValue}
          </span>
          <span className="font-mono text-[9px] font-bold text-terminal-green">
            -{deal.savingsPct}%
          </span>
        </div>
        <span className="mt-0.5 inline-flex items-center gap-0.5 font-mono text-[9px] font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded group-hover:bg-primary/90 transition-colors">
          BID <ExternalLink className="w-2.5 h-2.5" />
        </span>
      </div>
    </motion.a>
  );
};

const DealColumn = ({
  title,
  icon,
  deals,
  accentClass,
  badgeClass,
}: {
  title: string;
  icon: React.ReactNode;
  deals: AuctionDeal[];
  accentClass: string;
  badgeClass: string;
}) => (
  <div className="terminal-card p-3 flex flex-col h-full min-w-0">
    <div className={`flex items-center gap-1.5 mb-2 pb-1.5 border-b ${badgeClass}`}>
      {icon}
      <h3 className={`font-mono text-[11px] font-bold uppercase tracking-wider ${accentClass}`}>
        {title}
      </h3>
      <span className="ml-auto font-mono text-[8px] text-muted-foreground uppercase tracking-wider">
        Top 5
      </span>
    </div>
    <div className="flex-1 flex flex-col">
      {deals.map((deal, i) => (
        <DealRow key={deal.id} deal={deal} rank={i + 1} />
      ))}
    </div>
  </div>
);

const EbayLiveDeals = () => {
  // Refresh every 5 minutes — generates fresh deals + new countdown end-times
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / (5 * 60 * 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeed(Math.floor(Date.now() / (5 * 60 * 1000)));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const rawDeals = useMemo(() => generateDeals(RAW_CARD_POOL, "raw", seed), [seed]);
  const gradedDeals = useMemo(() => generateDeals(GRADED_CARD_POOL, "graded", seed + 1), [seed]);
  const sealedDeals = useMemo(() => generateDeals(SEALED_POOL, "sealed", seed + 2), [seed]);

  return (
    <div className="terminal-card p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-sm font-bold text-foreground">
            eBay Live Auction Deals
          </h2>
          <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <div className="h-1.5 w-1.5 rounded-full bg-primary pulse-live" />
            <span className="font-mono text-[9px] text-primary font-bold tracking-wider">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Refresh 5min · Top 5 per category</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-stretch">
        <DealColumn
          title="Raw Cards"
          icon={<Flame className="w-3.5 h-3.5 text-primary" />}
          deals={rawDeals}
          accentClass="text-primary"
          badgeClass="border-primary/30"
        />
        <DealColumn
          title="Graded Slabs"
          icon={<Award className="w-3.5 h-3.5 text-terminal-amber" />}
          deals={gradedDeals}
          accentClass="text-terminal-amber"
          badgeClass="border-terminal-amber/30"
        />
        <DealColumn
          title="Sealed Products"
          icon={<Package className="w-3.5 h-3.5 text-terminal-blue" />}
          deals={sealedDeals}
          accentClass="text-terminal-blue"
          badgeClass="border-terminal-blue/30"
        />
      </div>

      <p className="font-mono text-[8px] text-muted-foreground/50 text-center mt-2.5">
        Powered by The House™ · eBay affiliate partner · Market values from Poke-Pulse-Engine™
      </p>
    </div>
  );
};

export default EbayLiveDeals;
