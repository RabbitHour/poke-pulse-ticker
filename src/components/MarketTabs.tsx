import { useState } from "react";
import { rawCards, gradedCards, sealedProducts } from "@/data/marketData";
import type { CardData, SealedProduct } from "@/data/marketData";
import CardBoardTable from "./CardBoardTable";
import SealedTable from "./SealedTable";

const tabs = [
  { id: "raw", label: "RAW CARDS" },
  { id: "graded", label: "GRADED CARDS" },
  { id: "sealed", label: "SEALED PRODUCTS" },
] as const;

type TabId = typeof tabs[number]["id"];

interface MarketTabsProps {
  liveCards?: CardData[];
  liveGradedCards?: CardData[];
  liveSealedProducts?: SealedProduct[];
}

const MarketTabs = ({ liveCards, liveGradedCards, liveSealedProducts }: MarketTabsProps) => {
  const [active, setActive] = useState<TabId>("raw");
  const displayRaw = liveCards ?? [];
  const displayGraded = liveGradedCards ?? [];
  const displaySealed = liveSealedProducts ?? [];

  return (
    <div>
      <div className="flex border-b border-border mb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 font-mono text-xs tracking-widest transition-colors ${
              active === tab.id
                ? "text-secondary border-b-2 border-b-secondary -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {((active === "raw" && !displayRaw.length) || (active === "graded" && !displayGraded.length) || (active === "sealed" && !displaySealed.length)) && <p role="status" className="market-note">No source-backed quotes are available in this category. Sample prices are not substituted.</p>}
        {active === "raw" && <CardBoardTable cards={displayRaw} title="Raw card source quotes" />}
        {active === "graded" && <CardBoardTable cards={displayGraded} title="Graded asking-price quotes (available grades only)" showGrade />}
        {active === "sealed" && <SealedTable products={displaySealed} />}
      </div>
    </div>
  );
};

export default MarketTabs;
