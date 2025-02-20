"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { RadarChartData } from "../stock/AnalystEstimates";

export default function StockRadarChart({ data }: { data: RadarChartData }) {
  if (!data.recommendationTrend) {
    return <div>No data</div>;
  }

  const currentTrend = data.recommendationTrend.trend.find(
    (item) => item.period === "0m",
  );

  if (!currentTrend) {
    return <div>No current trend data</div>;
  }

  const chartData = [
    { label: "Neutral", value: currentTrend.hold },
    { label: "Buy", value: currentTrend.buy },
    { label: "Strong Buy", value: currentTrend.strongBuy },
    { label: "Strong Sell", value: currentTrend.strongSell },
    { label: "Sell", value: currentTrend.sell },
  ];

  return (
    <ResponsiveContainer
      width="100%"
      height={400}
      className="mx-auto aspect-square"
    >
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="label"
          tick={(props) => {
            const { payload, ...rest } = props;
            const dataItem = chartData.find(
              (item) => item.label === payload.value,
            );
            const displayValue = dataItem ? dataItem.value : "-";

            return (
              <text {...rest} y={rest.y + 4} className="text-sm font-medium">
                <tspan fill="var(--color-muted-foreground)">
                  {payload?.value}
                </tspan>
                <tspan fill="var(--color-card-foreground)">
                  {" "}
                  {displayValue}
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
          dot={{
            r: 4,
            fill: "var(--chart-blue)",
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
