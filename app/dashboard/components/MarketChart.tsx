"use client";
import React from "react";
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface Quote {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose?: number;
}

export interface ChartResult {
  quotes?: Quote[];
}

interface MarketChartProps {
  data: ChartResult;
  width?: string | number;
  height?: string | number;
  color?: string;
}

export default function MarketChart({
  data,
  width = "100%",
  height = "100%",
  color = "#047857",
}: MarketChartProps) {
  const chartData =
    data.quotes?.map((q) => ({
      date: q.date,
      close: q.close,
    })) ?? [];

  return (
    <ResponsiveContainer
      width={width}
      height={height}
      style={{ margin: 0, padding: 0 }}
    >
      <AreaChart
        data={chartData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="macGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="10%"
              stopColor={"var(--bg-glass-background-primary)"}
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor={"var(--bg-glass-background-primary)"}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="2 2"
          stroke="var(--glass-border-divider)"
        />
        <XAxis hide dataKey="date" axisLine={false} tickLine={false} />
        <YAxis
          tickMargin={0}
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "white",
            fontWeight: 550,
            fontSize: 13,
            opacity: 0.8,
          }}
          domain={["auto", "auto"]}
        />
        <Tooltip
          wrapperClassName="rounded-xl shadow-md backdrop-blur-sm text-sm font-semibold border-none"
          contentStyle={{
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          }}
          labelStyle={{ color: "var(--text-text-primary)" }}
          itemStyle={{ color: "var(--text-text-primary)" }}
          formatter={(value: number) => {
            const formatted = new Intl.NumberFormat("en", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2,
            }).format(value);
            return [formatted, "Price"];
          }}
          labelFormatter={(label) => {
            return new Date(label).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={"var(--glass-text-primary)"}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#macGradient)"
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
