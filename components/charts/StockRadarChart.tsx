"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { RecommendationTrend } from "@/types/yahooFinance";

interface StockRadarChartProps {
  trend: RecommendationTrend;
}

export default function StockRadarChart({ trend }: StockRadarChartProps) {
  const current = trend.trend.find((item) => item.period === "0m");
  if (!current) {
    return <div>No current trend data</div>;
  }

  const chartData = [
    { label: "Neutral", value: current.hold },
    { label: "Buy", value: current.buy },
    { label: "Strong Buy", value: current.strongBuy },
    { label: "Strong Sell", value: current.strongSell },
    { label: "Sell", value: current.sell },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid
          strokeWidth={2}
          stroke="var(--unique-background-glass-badge)"
        />
        <PolarAngleAxis
          dataKey="label"
          tick={({ payload, ...rest }) => {
            const item = chartData.find((d) => d.label === payload.value);
            const display = item ? item.value : "-";
            return (
              <text {...rest} y={rest.y + 4}>
                <tspan fill="var(--muted-foreground)" className="font-medium">
                  {payload.value}
                </tspan>
                <tspan
                  fill="var(--color-primary)"
                  className="font-nunito font-bold"
                >
                  {" "}
                  {display}
                </tspan>
              </text>
            );
          }}
        />
        <Radar
          name="Current"
          dataKey="value"
          stroke="var(--chart-blue)"
          fill="var(--chart-blue)"
          fillOpacity={0.6}
          dot={{ r: 4, fill: "var(--chart-blue)", fillOpacity: 1 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
