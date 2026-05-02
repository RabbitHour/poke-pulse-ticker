import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layers, TrendingUp, TrendingDown, Calendar, Info } from "lucide-react";
import type { CardData } from "@/data/marketData";
import InfoDialog from "@/components/InfoDialog";
import { useEbayPrices, ebayPriceMap } from "@/hooks/useEbayPrices";

const ERA_DESCRIPTIONS: Record<string, { description: string; details: string[] }> = {
  "VINTAGE (WOTC)": {
    description: "1999–2003 — the original Wizards of the Coast era. The bluest of blue-chip Pokémon TCG.",
    details: [
      "Includes Base Set, Jungle, Fossil, Team Rocket, Gym, Neo, and e-Reader sets.",
      "Lowest population, highest grading premiums (PSA 10s often 100x+ raw).",
      "Acts as the 'gold' of the Pokémon market — defensive in downturns.",
      "Watch first edition shadowless Charizard as the bellwether.",
    ],
  },
  "EX ERA": {
    description: "2003–2007 — Nintendo's first era. Holographic EX cards drove modern collector chase.",
    details: [
      "Ruby & Sapphire through Power Keepers. Includes Crystal Guardians, Delta Species.",
      "Strong cyclical demand from millennials returning to the hobby.",
      "Gold Star cards trade like vintage despite being newer.",
    ],
  },
  "DP / PLATINUM": {
    description: "2007–2010 — Diamond & Pearl through Call of Legends. The 'lost' middle era.",
    details: [
      "Underrated and under-graded vs. EX and Modern.",
      "Pop reports still small — long-tail PSA 10 supply pressure is low.",
      "Watch shiny LV.X and HGSS Lugia/Ho-Oh as leading indicators.",
    ],
  },
  "BW / XY": {
    description: "2011–2017 — Black & White through Generations. EX and Full Art era.",
    details: [
      "Massive print runs but iconic chase cards (Charizard EX FA, M Rayquaza EX FA).",
      "Gold Secret Rares introduced here drive premium grade demand.",
      "Generations 25th anniversary set is a sleeper.",
    ],
  },
  "SUN & MOON": {
    description: "2017–2020 — GX era. Hidden Fates Shiny Charizard remains a top-5 modern grail.",
    details: [
      "Rainbow Rares and Secret Rares dominate chase pulls.",
      "Hidden Fates and Shining Legends sealed = institutional-grade asset.",
      "Cosmic Eclipse closed the era with one of the most playable card pools.",
    ],
  },
  "MODERN": {
    description: "2020–Present — Sword & Shield through Scarlet & Violet. Highest volume, fastest moves.",
    details: [
      "Includes Evolving Skies, 151, Crown Zenith, Prismatic Evolutions.",
      "Largest print runs, but Alt Arts and SARs reach vintage prices fast.",
      "Most volatile era — best for tactical traders, riskiest for hodlers.",
      "Sealed booster boxes here often outperform raw singles long-term.",
    ],
  },
};

interface EraIndexCardsProps {
  cards: CardData[];
}

interface Era {
  label: string;
  tag: string;
  sets: string[];
  color: string;
  glowClass: string;
}

const ERAS: Era[] = [
  {
    label: "VINTAGE (WOTC)",
    tag: "1999–2003",
    sets: ["Base Set", "Base Set 2", "Jungle", "Fossil", "Team Rocket", "Gym Heroes", "Gym Challenge", "Neo Genesis", "Neo Discovery", "Neo Revelation", "Neo Destiny", "Legendary Collection", "Expedition Base Set", "Aquapolis", "Skyridge", "POP Series", "Poké Rumble", "Southern Islands", "Best of Game"],
    color: "text-terminal-amber",
    glowClass: "glow-amber",
  },
  {
    label: "EX ERA",
    tag: "2003–2007",
    sets: ["Ruby & Sapphire", "Sandstorm", "Dragon", "Team Magma vs Team Aqua", "Hidden Legends", "FireRed & LeafGreen", "Team Rocket Returns", "Deoxys", "Emerald", "Unseen Forces", "Delta Species", "Legend Maker", "Holon Phantoms", "Crystal Guardians", "Dragon Frontiers", "Power Keepers", "EX"],
    color: "text-terminal-blue",
    glowClass: "glow-blue",
  },
  {
    label: "DP / PLATINUM",
    tag: "2007–2010",
    sets: ["Diamond & Pearl", "Mysterious Treasures", "Secret Wonders", "Great Encounters", "Majestic Dawn", "Legends Awakened", "Stormfront", "Platinum", "Rising Rivals", "Supreme Victors", "Arceus", "HeartGold & SoulSilver", "Unleashed", "Undaunted", "Triumphant", "Call of Legends", "HGSS"],
    color: "text-purple-400",
    glowClass: "",
  },
  {
    label: "BW / XY",
    tag: "2011–2017",
    sets: ["Black & White", "Emerging Powers", "Noble Victories", "Next Destinies", "Dark Explorers", "Dragons Exalted", "Boundaries Crossed", "Plasma Storm", "Plasma Freeze", "Plasma Blast", "Legendary Treasures", "XY", "Flashfire", "Furious Fists", "Phantom Forces", "Primal Clash", "Roaring Skies", "Ancient Origins", "BREAKthrough", "BREAKpoint", "Fates Collide", "Steam Siege", "Evolutions", "Generations"],
    color: "text-sky-400",
    glowClass: "",
  },
  {
    label: "SUN & MOON",
    tag: "2017–2020",
    sets: ["Sun & Moon", "Guardians Rising", "Burning Shadows", "Shining Legends", "Crimson Invasion", "Ultra Prism", "Forbidden Light", "Celestial Storm", "Dragon Majesty", "Lost Thunder", "Team Up", "Unbroken Bonds", "Unified Minds", "Hidden Fates", "Cosmic Eclipse", "Detective Pikachu"],
    color: "text-orange-400",
    glowClass: "",
  },
  {
    label: "MODERN",
    tag: "2020–Present",
    sets: ["Sword & Shield", "Rebel Clash", "Darkness Ablaze", "Champion's Path", "Vivid Voltage", "Shining Fates", "Battle Styles", "Chilling Reign", "Evolving Skies", "Celebrations", "Fusion Strike", "Brilliant Stars", "Astral Radiance", "Lost Origin", "Silver Tempest", "Crown Zenith", "Scarlet & Violet", "Paldea Evolved", "Obsidian Flames", "151", "Paldean Fates", "Temporal Forces", "Twilight Masquerade", "Shrouded Fable", "Stellar Crown", "Surging Sparks", "Prismatic Evolutions", "Journey Together"],
    color: "text-primary",
    glowClass: "glow-green",
  },
];

function categorizeCards(cards: CardData[]): { era: Era; cards: CardData[] }[] {
  const matched = new Set<number>();
  const result: { era: Era; cards: CardData[] }[] = [];

  // Match all non-Modern eras first
  for (const era of ERAS) {
    if (era.label === "MODERN") continue;
    const eraCards: CardData[] = [];
    cards.forEach((card, idx) => {
      if (!matched.has(idx) && era.sets.some(s => card.set.includes(s))) {
        eraCards.push(card);
        matched.add(idx);
      }
    });
    result.push({ era, cards: eraCards });
  }

  // Modern = explicitly matched modern sets + everything unmatched (catch-all)
  const modernEra = ERAS.find(e => e.label === "MODERN")!;
  const modernCards = cards.filter((_, idx) => !matched.has(idx));
  result.push({ era: modernEra, cards: modernCards });

  return result.filter(r => r.cards.length > 0);
}

const EraIndexCards = ({ cards }: EraIndexCardsProps) => {
  const eras = categorizeCards(cards);
  const [activeEra, setActiveEra] = useState<{ era: Era; cards: CardData[] } | null>(null);

  // eBay Browse API: pull median prices for the top-3 cards in each era as the
  // index price source. Avg is computed from eBay medians, falling back to
  // the per-card .market value when eBay returns no listings.
  const ebayQueries = useMemo(() => {
    const qs: string[] = [];
    for (const { cards: ec } of eras) {
      for (const c of ec.slice(0, 3)) qs.push(`${c.name} ${c.set}`);
    }
    return Array.from(new Set(qs));
  }, [eras]);
  const { data: ebayData } = useEbayPrices(ebayQueries);
  const priceMap = useMemo(() => ebayPriceMap(ebayData?.results), [ebayData]);
  const priceFor = (c: CardData) => priceMap[`${c.name} ${c.set}`.toLowerCase()] || c.market;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Era-Based Market Indexes
        </h2>
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
          Tap an era for details • Live Data
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 divide-border">
        {eras.map(({ era, cards: eraCards }, idx) => {
          const avgPrice = eraCards.length > 0 ? eraCards.reduce((s, c) => s + c.market, 0) / eraCards.length : 0;
          const avgChange = eraCards.length > 0 ? eraCards.reduce((s, c) => s + c.change, 0) / eraCards.length : 0;
          const isUp = avgChange >= 0;
          const totalCap = eraCards.reduce((s, c) => s + c.market, 0);

          return (
            <motion.button
              type="button"
              onClick={() => setActiveEra({ era, cards: eraCards })}
              key={era.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="px-3 py-3 text-left hover:bg-muted/30 transition-colors border-r border-border last:border-r-0 cursor-pointer relative group"
            >
              <Info className="w-2.5 h-2.5 text-muted-foreground/40 absolute top-1.5 right-1.5 group-hover:text-primary transition-colors" />
              <div className="flex items-center gap-1.5 mb-1.5">
                <Layers className={`w-3 h-3 ${era.color}`} />
                <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${era.color} leading-tight`}>
                  {era.label}
                </span>
              </div>
              <span className="font-mono text-[8px] text-muted-foreground block mb-1">{era.tag}</span>
              <p className="text-lg font-extrabold text-foreground leading-none">
                ${avgPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="font-mono text-[8px] text-muted-foreground mb-1.5">Avg card value</p>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[9px] font-semibold flex items-center gap-0.5 ${isUp ? "text-terminal-green" : "text-terminal-red"}`}>
                  {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {isUp ? "+" : ""}{avgChange.toFixed(2)}%
                </span>
              </div>
              <span className="font-mono text-[8px] text-muted-foreground">
                {eraCards.length} cards • ${totalCap.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </motion.button>
          );
        })}
      </div>

      <InfoDialog
        open={!!activeEra}
        onOpenChange={(open) => !open && setActiveEra(null)}
        title={activeEra ? `${activeEra.era.label} • ${activeEra.era.tag}` : ""}
        description={activeEra ? ERA_DESCRIPTIONS[activeEra.era.label]?.description : undefined}
      >
        {activeEra && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="terminal-card p-2">
                <p className="font-mono text-[9px] text-muted-foreground uppercase">Cards Tracked</p>
                <p className="font-mono text-sm font-bold text-foreground">{activeEra.cards.length}</p>
              </div>
              <div className="terminal-card p-2">
                <p className="font-mono text-[9px] text-muted-foreground uppercase">Total Market Cap</p>
                <p className="font-mono text-sm font-bold text-primary">
                  ${activeEra.cards.reduce((s, c) => s + c.market, 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                What you should know
              </p>
              <ul className="space-y-1.5">
                {ERA_DESCRIPTIONS[activeEra.era.label]?.details.map((d) => (
                  <li key={d} className="font-mono text-[11px] text-foreground flex gap-2">
                    <span className="text-primary">›</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Sets in this era
              </p>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                {activeEra.era.sets.join(" · ")}
              </p>
            </div>
          </>
        )}
      </InfoDialog>
    </motion.div>
  );
};

export default EraIndexCards;
