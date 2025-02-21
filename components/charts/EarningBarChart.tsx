"use client";

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
import { EarningsData } from "../stock/Earnings";

const formatMarketCap = (value: number): string => {
  if (value === 0) return "$0";
  if (value >= 1e12) return `$${value / 1e12}T`;
  if (value >= 1e9) return `$${value / 1e9}B`;
  if (value >= 1e6) return `$${value / 1e6}M`;
  return `$${value}`;
};

interface CustomBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
}

// Helper to generate an SVG path for a rectangle with only top rounded corners.
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

const CustomRevenueBar = ({ x, y, width, height, fill }: CustomBarProps) => {
  const path = getRoundedTopRectPath(x, y, width, height, 10);
  return <path d={path} fill={fill} fillOpacity={1} />;
};

const CustomEarningsBar = ({ x, y, width, height }: CustomBarProps) => {
  const radius = 10;
  const path = getRoundedTopRectPath(x, y, width, height, radius);
  return (
    <path
      d={path}
      fill="var(--chart-orange)"
      fillOpacity={0.2}
      stroke="url(#earningsStrokeGradient)"
      strokeWidth={2}
      strokeDasharray="3 3"
    />
  );
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/40 rounded-md border p-2 text-sm font-medium shadow-md backdrop-blur-sm">
        <p className="text-primary">
          {payload[0].payload.revenue && (
            <span>Revenue: {formatMarketCap(payload[0].payload.revenue)}</span>
          )}
        </p>
        <p className="text-(--chart-orange)">
          <span>Earnings: </span>
          {formatMarketCap(payload[0].payload.earnings)}
        </p>
      </div>
    );
  }
  return null;
};

export default function EarningBarChart({ data }: { data: EarningsData }) {
  // Focus on quarterly data for now.
  const { quarterly } = data.earnings?.financialsChart || {};

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={quarterly}>
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
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor="var(--chart-orange)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <XAxis
            tickLine={false}
            axisLine={false}
            dataKey="date"
            type="category"
            tickFormatter={(value) => value.replace(/(\d+Q)(\d+)/, "$1 $2")}
            allowDuplicatedCategory={false}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 14,
              fontWeight: "500",
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            orientation="right"
            scale="linear"
            tickFormatter={(value: number) => formatMarketCap(value)}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 12,
              fontWeight: "500",
            }}
            padding={{ top: 20, bottom: 20 }}
          />
          <CartesianGrid
            syncWithTicks
            vertical={false}
            stroke="var(--color-border)"
            strokeWidth={1}
            strokeDasharray="4"
          />

          <Tooltip cursor={false} content={<CustomTooltip />} />

          <Bar
            dataKey="revenue"
            fill="var(--primary)"
            shape={<CustomRevenueBar />}
          />
          <Bar dataKey="earnings" shape={<CustomEarningsBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
