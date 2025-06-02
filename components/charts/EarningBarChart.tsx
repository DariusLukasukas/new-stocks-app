"use client";

import { QuarterlyDataPoint } from "@/types/yahooFinance";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

// helper to format big numbers
const formatMarketCap = (value: number): string => {
  if (value === 0) return "$0";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
};

interface EarningBarChartProps {
  data: QuarterlyDataPoint[];
}

interface CustomBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
}

const getRoundedTopRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string => {
  const r = Math.min(radius, width / 2);
  return `
    M${x},${y + height}
    L${x},${y + r}
    Q${x},${y} ${x + r},${y}
    L${x + width - r},${y}
    Q${x + width},${y} ${x + width},${y + r}
    L${x + width},${y + height}
    Z
  `;
};

const CustomRevenueBar = ({ x, y, width, height, fill }: CustomBarProps) => (
  <path d={getRoundedTopRectPath(x, y, width, height, 10)} fill={fill} />
);

const CustomEarningsBar = ({ x, y, width, height }: CustomBarProps) => (
  <path
    d={getRoundedTopRectPath(x, y, width, height, 10)}
    fill="var(--chart-orange)"
    fillOpacity={0.2}
    stroke="url(#earningsStrokeGradient)"
    strokeWidth={2}
    strokeDasharray="3 3"
  />
);

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as QuarterlyDataPoint;
    return (
      <div className="bg-glass-background-primary text-glass-text-primary rounded-xl px-4 py-2 text-sm leading-8 font-semibold shadow-md backdrop-blur-xl">
        <p>Revenue: {formatMarketCap(point.revenue)}</p>
        <p className="text-(--chart-orange)">
          Earnings: {formatMarketCap(point.earnings)}
        </p>
      </div>
    );
  }
  return null;
};

export default function EarningBarChart({ data }: EarningBarChartProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient
              id="earningsStrokeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop
                offset="0%"
                stopColor="var(--chart-orange)"
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-orange)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            type="category"
            tickFormatter={(v) => (v as string).replace(/(\d+Q)(\d+)/, "$1 $2")}
            axisLine={false}
            tickLine={false}
            allowDuplicatedCategory={false}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 14,
              fontWeight: 500,
            }}
          />

          <YAxis
            orientation="right"
            tickFormatter={formatMarketCap}
            axisLine={false}
            tickLine={false}
            padding={{ top: 20, bottom: 20 }}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="4"
          />

          <Tooltip cursor={false} content={<CustomTooltip />} />

          <Bar
            dataKey="revenue"
            fill="var(--primary)"
            shape={(props) => <CustomRevenueBar {...props} />}
          />
          <Bar
            dataKey="earnings"
            shape={(props) => <CustomEarningsBar {...props} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
