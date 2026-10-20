import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketIndex } from "@/hooks/useMarketIndexes";

interface IndexDayChartProps {
  title: string;
  variant: "green" | "amber" | "blue";
  index?: MarketIndex;
  isLoading?: boolean;
}

const VARIANT_CONFIG = {
  green: { stroke: "hsl(var(--terminal-green))", label: "RAW" },
  amber: { stroke: "hsl(var(--terminal-amber))", label: "GRADED" },
  blue: { stroke: "hsl(var(--terminal-blue))", label: "SEALED" },
};

const TIME_RANGES = ["1D", "5D", "1M"] as const;
type TimeRange = (typeof TIME_RANGES)[number];
const RANGE_MS: Record<TimeRange, number> = {
  "1D": 24 * 3600 * 1000,
  "5D": 5 * 24 * 3600 * 1000,
  "1M": 30 * 24 * 3600 * 1000,
};

function fmtTime(iso: string, range: TimeRange) {
  const d = new Date(iso);
  if (range === "1D") {
    return d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
}

/**
 * Plots ONLY real stored index observations. When a range has too few
 * observations we say so instead of drawing an invented curve.
 */
const IndexDayChart = ({ title, variant, index, isLoading }: IndexDayChartProps) => {
  const [range, setRange] = useState<TimeRange>("1D");
  const config = VARIANT_CONFIG[variant];

  const data = useMemo(() => {
    if (!index) return [];
    const cutoff = Date.now() - RANGE_MS[range];
    const pts = index.series.filter((p) => new Date(p.t).getTime() >= cutoff);
    // Downsample long ranges to ~120 points, always keeping the latest.
    const step = Math.max(1, Math.ceil(pts.length / 120));
    const sampled = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
    return sampled.map((p) => ({ time: fmtTime(p.t, range), iso: p.t, value: p.v }));
  }, [index, range]);

  const textColor =
    variant === "green" ? "text-terminal-green" : variant === "amber" ? "text-terminal-amber" : "text-terminal-blue";

  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? index?.value ?? 0;
  const periodChange = first > 0 ? ((last - first) / first) * 100 : 0;
  const periodUp = periodChange >= 0;
  const values = data.map((d) => d.value);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const padding = (maxVal - minVal) * 0.15 || Math.max(1, maxVal * 0.01);
  const enoughHistory = data.length >= 2;

  return (
    <div className="terminal-card overflow-hidden">
      <div className="border-b border-border px-3 py-2.5 flex items-center justify-between gap-1">
        <span className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate ${textColor}`}>
          {title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-1.5 py-0.5 font-mono text-[9px] rounded transition-colors ${
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            {index ? `$${index.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          </span>
          {enoughHistory && (
            <span
              className={`font-mono text-[10px] font-semibold flex items-center gap-0.5 ${
                periodUp ? "text-terminal-green" : "text-terminal-red"
              }`}
            >
              {periodUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {periodUp ? "+" : ""}
              {periodChange.toFixed(2)}%
            </span>
          )}
        </div>
        <span className="font-mono text-[8px] text-muted-foreground">
          {index ? `${data.length} live obs` : ""}
        </span>
      </div>

      <div className="px-3 pb-0">
        <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-wider">
          {index
            ? `${index.source} • updated ${new Date(index.capturedAt).toLocaleTimeString("en-US", {
                timeZone: "America/New_York",
                hour: "numeric",
                minute: "2-digit",
              })} ET`
            : isLoading
            ? "Loading live observations…"
            : "Collecting first live observations…"}
        </span>
      </div>

      <div className="px-2 pb-3 relative" style={{ height: 180 }}>
        {!enoughHistory && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="font-mono text-[10px] text-muted-foreground">
              {index
                ? "Building real price history — new live points are added every 10 minutes."
                : "Waiting for the first live price snapshot."}
            </p>
          </div>
        )}
        {enoughHistory && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.stroke} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={config.stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={[minVal - padding, maxVal + padding]}
                tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontFamily: "JetBrains Mono",
                  fontSize: 11,
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  config.label,
                ]}
                labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <ReferenceLine y={first} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} />
              <Area
                type="stepAfter"
                dataKey="value"
                stroke={config.stroke}
                strokeWidth={2}
                fill={`url(#gradient-${variant})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IndexDayChart;
