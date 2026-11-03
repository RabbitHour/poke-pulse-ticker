import { CardImage } from "./CardImage";
import { motion } from "framer-motion";
import type { SealedProduct } from "@/data/marketData";
import { getSealedToken } from "@/lib/tokenSymbols";

interface SealedTableProps {
  products: SealedProduct[];
}

const SealedTable = ({ products }: SealedTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="font-mono text-xs tracking-widest text-secondary uppercase font-semibold">
          Sealed product source quotes
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground">{products.length} items</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Ticker</th>
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Product</th>
              <th className="px-4 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Type</th>
              <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Market</th>
              <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Low</th>
              <th className="px-4 py-2 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Chg%</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="data-row">
                <td className="px-4 py-2">
                  <span className="font-mono text-[10px] text-terminal-blue font-bold tracking-wider bg-terminal-blue/10 px-1.5 py-0.5 rounded">
                    {getSealedToken(p)}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-sm text-foreground font-medium"><div className="flex items-center gap-2"><CardImage src={p.image} alt={p.name} className="w-10 h-12 object-contain" /><span>{p.name}</span></div></td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.type}</td>
                <td className="px-4 py-2 font-mono text-sm text-foreground text-right">
                  ${p.market.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground text-right">
                  —
                </td>
                <td className={`px-4 py-2 font-mono text-sm text-right font-semibold ${p.change >= 0 ? "text-terminal-green" : "text-terminal-red"}`}>
                  {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SealedTable;
