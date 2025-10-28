"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TimeRange, usePortfolioStore } from "@/store/portfolio-store";

type ChartDatum = {
  label: string;
  value: number;
};

const chartData: Record<TimeRange, ChartDatum[]> = {
  "1M": [
    { label: "Week 1", value: 124_500 },
    { label: "Week 2", value: 127_200 },
    { label: "Week 3", value: 126_400 },
    { label: "Week 4", value: 130_100 },
  ],
  "3M": [
    { label: "Aug", value: 118_000 },
    { label: "Sep", value: 122_400 },
    { label: "Oct", value: 128_900 },
  ],
  "6M": [
    { label: "Jun", value: 109_200 },
    { label: "Jul", value: 115_300 },
    { label: "Aug", value: 118_400 },
    { label: "Sep", value: 122_400 },
    { label: "Oct", value: 128_900 },
    { label: "Nov", value: 132_100 },
  ],
  "1Y": [
    { label: "Jan", value: 98_000 },
    { label: "Mar", value: 103_400 },
    { label: "May", value: 111_200 },
    { label: "Jul", value: 118_000 },
    { label: "Sep", value: 122_400 },
    { label: "Nov", value: 132_100 },
  ],
  "5Y": [
    { label: "2020", value: 64_500 },
    { label: "2021", value: 82_100 },
    { label: "2022", value: 90_400 },
    { label: "2023", value: 104_900 },
    { label: "2024", value: 132_100 },
  ],
};

export function PerformanceChart() {
  const range = usePortfolioStore((state) => state.range);
  const data = chartData[range];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -24, right: 12 }}>
          <defs>
            <linearGradient id="performance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#performance)"
            name="Portfolio value"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDatum;
  }>;
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0];

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-semibold">{dataPoint.payload.label}</p>
      <p className="text-xs text-muted-foreground">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(dataPoint.value ?? 0)}
      </p>
    </div>
  );
}
