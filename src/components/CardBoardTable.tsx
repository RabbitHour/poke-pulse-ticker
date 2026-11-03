import { CardImage } from "./CardImage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { CardData } from "@/data/marketData";
import { getCardToken } from "@/lib/tokenSymbols";
import { getCardSignal } from "@/hooks/useSignalIndicator";
import SignalBadge from "@/components/SignalBadge";

const cardRoute = (card: CardData) =>
  card._apiId ? `/card/${card._apiId}` : `/card/${encodeURIComponent(`${card.name}-${card.set}-${card.number}`.replace(/\s+/g, "-").toLowerCase())}`;

interface CardBoardTableProps {
  cards: CardData[];
  title: string;
  showGrade?: boolean;
}

const GRADING_COMPANIES = ["ALL", "PSA", "CGC", "BGS", "TAG"] as const;

const CardBoardTable = ({ cards, title, showGrade = false }: CardBoardTableProps) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"market" | "change">("market");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [compact, setCompact] = useState(false);

  const toggleSort = (col: "market" | "change") => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const searchFiltered = searchQuery.trim()
    ? cards.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.set.toLowerCase().includes(searchQuery.toLowerCase()))
    : cards;

  const filtered = gradeFilter === "ALL" || !showGrade
    ? searchFiltered
    : searchFiltered.filter(c => c.grade?.startsWith(gradeFilter));

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    return (a[sortBy] - b[sortBy]) * mul;
  });

  const SortIcon = ({ col }: { col: "market" | "change" }) => (
    <span className="ml-1 text-muted-foreground">{sortBy === col ? (sortDir === "desc" ? "↓" : "↑") : ""}</span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-mono text-xs tracking-widest text-secondary uppercase font-semibold">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or set…"
              className="w-36 md:w-48 rounded border border-border bg-muted px-2 py-1 pl-7 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <svg className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
          {showGrade && (
            <div className="flex gap-1">
              {GRADING_COMPANIES.map(company => (
                <button
                  key={company}
                  onClick={() => setGradeFilter(company)}
                  className={`px-2 py-0.5 font-mono text-[10px] tracking-wider rounded transition-colors ${
                    gradeFilter === company
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          )}
          <span className="font-mono text-[10px] text-muted-foreground">{filtered.length} items</span>
          <button
            onClick={() => setCompact(c => !c)}
            className="px-2 py-0.5 font-mono text-[10px] tracking-wider rounded transition-colors border border-border text-muted-foreground hover:text-foreground"
          >
            {compact ? "EXPANDED" : "COMPACT"}
          </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Ticker</th>
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Card</th>
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Set</th>
              {showGrade && (
                <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Grade</th>
              )}
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">#</th>
              <th
                className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("market")}
              >
                Market<SortIcon col="market" />
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Low</th>
              <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Mid</th>
              <th
                className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("change")}
              >
                Chg%<SortIcon col="change" />
              </th>
              <th className="px-4 py-2 text-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Signal</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 100).map((card, i) => (
              <tr key={i} className={`data-row cursor-pointer ${compact ? "h-8" : ""}`} onClick={() => { if (card._apiId) navigate(cardRoute(card)); }}>
                <td className={compact ? "px-2 py-1" : "px-4 py-2"}>
                  <span className="font-mono text-[10px] text-primary font-bold tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                    {getCardToken(card)}
                  </span>
                </td>
                <td className={`${compact ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"} font-mono text-foreground font-medium flex items-center gap-2`}>
                  {!compact && <CardImage src={card._image} alt={card.name} className="w-9 h-12 rounded object-contain" />}
                  {card.name}
                </td>
                {!compact && <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{card.set}</td>}
                {showGrade && !compact && (
                  <td className="px-4 py-2 font-mono text-xs text-terminal-amber font-semibold">{card.grade}</td>
                )}
                {!compact && <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{card.number}</td>}
                <td className={`${compact ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"} font-mono text-foreground text-right`}>
                  ${card.market.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                {!compact && (
                  <>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground text-right">
                      {showGrade ? "—" : "$" + card.low.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground text-right">
                      {showGrade ? "—" : "$" + card.mid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </>
                )}
                <td className={`${compact ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"} font-mono text-right font-semibold ${card.change >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                  {showGrade ? "—" : (card.change >= 0 ? "+" : "") + card.change.toFixed(2) + "%"}
                </td>
                {!compact && (
                  <td className="px-4 py-2 text-center">
                    {showGrade ? "Not measured" : <SignalBadge result={getCardSignal(card)} />}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CardBoardTable;
