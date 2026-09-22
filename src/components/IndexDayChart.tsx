import { useMemo, useState, useEffect } from "react";
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

interface IndexDayChartProps {
  title: string;
  indexValue: number;
  indexChange: number;
  variant: "green" | "amber" | "blue";
  refreshKey?: number;
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

const TIME_RANGES = ["1D", "5D", "1M"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

function generateIntradayData(baseValue: number, dailyChangePct: number) {
  const slots: { h: number; m: number }[] = [];
  let h = 9;
  let m = 30;

  while (h < 16 || (h === 16 && m <= 0)) {
    slots.push({ h, m });
    m += 15;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }

  const openValue = baseValue / (1 + dailyChangePct / 100);
  const totalChange = baseValue - openValue;
  const now = new Date();
  const seed = now.getDate() + now.getMonth() * 31;

  const data = slots.map((slot, i) => {
    const progress = i / (slots.length - 1);
    const curve = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const noise = Math.sin(seed * 7.3 + i * 4.1) * 0.003 * openValue;
    const midNoise = Math.cos(seed * 3.7 + i * 2.9) * 0.002 * openValue;
    const value = openValue + totalChange * curve + noise + midNoise;

    const isPM = slot.h >= 12;
    const displayH = slot.h > 12 ? slot.h - 12 : slot.h;
    const label = `${displayH}:${slot.m.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`;

    return { time: label, value: Math.max(0, value) };
  });

  return { data, openValue };
}

function generateMultiDayData(baseValue: number, days: number) {
  const now = new Date();
  const seed = now.getDate() + now.getMonth() * 31 + now.getFullYear();
  const points: { date: Date; value: number }[] = [];

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    const daySeed = seed + d * 17;
    const value = baseValue * (1 + Math.sin(daySeed * 2.1) * 0.03);
    points.push({ date, value });
  }

  const data: { time: string; value: number }[] = [];

  if (days <= 5) {
    points.forEach((pt, idx) => {
      const daySeed = seed + idx * 19;
      for (let slot = 0; slot < 4; slot++) {
        const noise = Math.sin(daySeed + slot * 5.7) * 0.004 * pt.value;
        const slotValue = pt.value + noise;
        const dateLabel = pt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        data.push({
          time: slot === 0 || slot === 3 ? dateLabel : "",
          value: Math.max(0, slotValue),
        });
      }
    });
  } else {
    points.forEach((pt) => {
      data.push({
        time: pt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.max(0, pt.value),
      });
    });
  }

  const openValue = data.length > 0 ? data[0].value : baseValue;
  return { data, openValue };
}

const RANGE_LABELS: Record<TimeRange, string> = {
  "1D": "NYSE Hours • 9:30 AM – 4:00 PM ET",
  "5D": "5-Day • NYSE Trading Days",
  "1M": "1-Month • NYSE Trading Days",
};

function getCurrentETLabel(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getNowSlotLabel(data: { time: string }[]): string | null {
  const etLabel = getCurrentETLabel();
  const match = etLabel.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return null;

  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  const totalMin =
    ((ampm === "PM" && h !== 12) ? h + 12 : (ampm === "AM" && h === 12) ? 0 : h) * 60 + m;

  if (totalMin < 570 || totalMin > 960) return null;

  let closest = data[0]?.time ?? null;
  let closestDiff = Infinity;

  for (const d of data) {
    const sm = d.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!sm) continue;
    const sh = parseInt(sm[1], 10);
    const smn = parseInt(sm[2], 10);
    const sap = sm[3].toUpperCase();
    const slotMin =
      ((sap === "PM" && sh !== 12) ? sh + 12 : (sap === "AM" && sh === 12) ? 0 : sh) * 60 + smn;
    const diff = Math.abs(slotMin - totalMin);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = d.time;
    }
  }

  return closest;
}

const IndexDayChart = ({
  title,
  indexValue,
  indexChange,
  variant,
  refreshKey = 0,
}: IndexDayChartProps) => {
  const [range, setRange] = useState<TimeRange>("1D");
  const [nowLabel, setNowLabel] = useState<string | null>(null);
  const config = VARIANT_CONFIG[variant];

  const { data, openValue } = useMemo(() => {
    if (range === "1D") return generateIntradayData(indexValue, indexChange);
    return generateMultiDayData(indexValue, range === "5D" ? 5 : 30);
  }, [indexValue, indexChange, range, refreshKey]);

  useEffect(() => {
    const update = () => {
      if (range === "1D" && data.length > 0) {
        setNowLabel(getNowSlotLabel(data));
      } else {
        const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const found = data.find((d) => d.time === todayLabel);
        setNowLabel(found ? todayLabel : null);
      }
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [range, data]);

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const padding = (maxVal - minVal) * 0.15 || 1;

  const periodChange =
    (((data[data.length - 1]?.value ?? 0) - (data[0]?.value ?? 0)) / (data[0]?.value || 1)) * 100;
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

        <div className="flex items-center gap-1 shrink-0">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-1.5 py-0.5 font-mono text-[9px] rounded transition-colors ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
          {RANGE_LABELS[range]}
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

            {nowLabel && (
              <ReferenceLine
                x={nowLabel}
                stroke="hsl(45, 100%, 55%)"
                strokeWidth={1.5}
                strokeDasharray="3 2"
                label={{
                  value: "NOW",
                  position: "top",
                  fill: "hsl(45, 100%, 55%)",
                  fontSize: 8,
                  fontFamily: "JetBrains Mono",
                  fontWeight: 700,
                }}
              />
            )}

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
