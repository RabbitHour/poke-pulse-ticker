import { useMemo } from "react";
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
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface IndexDayChartProps {
  title: string;
  indexValue: number;
  indexChange: number;
  variant: "green" | "amber" | "blue";
  sampleSize: number;
}

const VARIANT_CONFIG = {
  green: {
    stroke: "hsl(var(--terminal-green))",
    fill: "hsl(var(--terminal-green))",
    label: "RAW 1000",
  },
  amber: {
    stroke: "hsl(var(--terminal-amber))",
    fill: "hsl(var(--terminal-amber))",
    label: "GRADED 1000",
  },
  blue: {
    stroke: "hsl(210, 100%, 60%)",
    fill: "hsl(210, 100%, 60%)",
    label: "SEALED 1000",
  },
};

const IndexDayChart = ({
  title,
  indexValue,
  indexChange,
  variant,
  sampleSize,
}: IndexDayChartProps) => {
  const config = VARIANT_CONFIG[variant];

  const openValue = indexChange > -100 ? indexValue / (1 + indexChange / 100) : indexValue;
  const data = useMemo(() => [
    { time: "24H AGO", value: Math.max(0, openValue) },
    { time: "NOW", value: Math.max(0, indexValue) },
  ], [indexValue, openValue]);

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const padding = (maxVal - minVal) * 0.15 || 1;

  const periodChange = indexChange;
  const periodUp = periodChange >= 0;

  return (
    <div className="terminal-card overflow-hidden">
      <div className="border-b border-border px-3 py-2.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate ${
              variant === "green"
                ? "text-terminal-green"
                : variant === "amber"
                ? "text-terminal-amber"
                : "text-terminal-blue"
            }`}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-primary">
          <Activity className="h-3 w-3" />
          <span className="font-mono text-[8px]">{sampleSize} LIVE COMPS</span>
        </div>
      </div>

      <div className="px-3 pt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            ${indexValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className={`font-mono text-[10px] font-semibold flex items-center gap-0.5 ${
              periodUp ? "text-terminal-green" : "text-terminal-red"
            }`}
          >
            {periodUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {periodUp ? "+" : ""}
            {periodChange.toFixed(2)}%
          </span>
        </div>

        <span className="font-mono text-[8px] text-muted-foreground">
          Open: ${openValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="px-3 pb-0">
        <span className="font-mono text-[7px] text-muted-foreground uppercase tracking-wider">
          REAL 24H EBAY MARKET SNAPSHOTS • NO GENERATED CURVES
        </span>
      </div>

      <div className="px-2 pb-3" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.fill} stopOpacity={0.25} />
                <stop offset="100%" stopColor={config.fill} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" vertical={false} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 8, fill: "hsl(215, 15%, 45%)", fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />

            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tick={{ fontSize: 8, fill: "hsl(215, 15%, 45%)", fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`}
              width={48}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 20%, 8%)",
                border: "1px solid hsl(220, 15%, 16%)",
                borderRadius: "6px",
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
              formatter={(value: number) => [
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                config.label,
              ]}
              labelStyle={{ color: "hsl(215, 15%, 55%)", fontSize: 10 }}
            />

            <ReferenceLine
              y={openValue}
              stroke="hsl(215, 15%, 30%)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />


            <Area
              type="monotone"
              dataKey="value"
              stroke={config.stroke}
              strokeWidth={2}
              fill={`url(#gradient-${variant})`}
              dot={false}
              activeDot={{
                r: 3,
                stroke: config.stroke,
                strokeWidth: 2,
                fill: "hsl(220, 20%, 8%)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndexDayChart;
