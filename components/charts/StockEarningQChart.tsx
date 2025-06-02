"use client";

import React from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import type {
  EarningsChart,
  QuarterlyEarningsPoint,
} from "@/types/yahooFinance";
import type { Props as DotProps } from "recharts/types/shape/Dot";

interface StockEarningQChartProps {
  chart: EarningsChart;
}

const CustomActualCircle = ({ cx, cy, r = 12 }: DotProps) => (
  <circle cx={cx} cy={cy} r={r} fill="var(--color-primary)" />
);

const CustomEstimateCircle = ({ cx, cy, r = 12 }: DotProps) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill="url(#diagonalPattern)"
    stroke="var(--chart-orange)"
    strokeWidth={2}
    strokeDasharray="3 3"
  />
);

const CustomReferenceTriangle = ({ cx, cy, payload }: any) => {
  const { hit } = payload as { hit: boolean };
  const fill = hit ? "var(--chart-green)" : "var(--chart-red)";
  const r = 8;

  // point‐up if beat, point‐down if missed
  const points = hit
    ? `${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`
    : `${cx - r},${cy - r} ${cx + r},${cy - r} ${cx},${cy + r}`;

  return (
    <g pointerEvents="none">
      <polygon points={points} fill={fill} />
      <text
        x={cx}
        y={cy - r - 6}
        textAnchor="middle"
        fill={fill}
        fontSize={12}
        fontWeight="bold"
      >
        {hit ? "beat" : "missed"}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }

  // payload[0].payload is the original data-point object (a QuarterlyEarningsPoint or similar),
  // which may have both `actual` and `estimate`, or only one of them.
  const d = payload[0].payload as Partial<QuarterlyEarningsPoint>;

  return (
    <div className="bg-glass-background-primary text-glass-text-primary rounded-xl px-4 py-2 text-sm leading-8 font-semibold shadow-md backdrop-blur-xl">
      {/* Only show “Estimate” if it’s defined on this point */}
      {typeof d.estimate === "number" && (
        <p className="text-[var(--chart-orange)]">
          Estimate: ${d.estimate.toFixed(2)}
        </p>
      )}

      {/* Only show “Actual” if it’s defined on this point */}
      {typeof d.actual === "number" && <p>Actual: ${d.actual.toFixed(2)}</p>}
    </div>
  );
};
export default function StockEarningQChart({ chart }: StockEarningQChartProps) {
  const {
    quarterly,
    currentQuarterEstimate,
    currentQuarterEstimateDate,
    currentQuarterEstimateYear,
  } = chart;

  // Build the “current estimate” point
  const currentPoint = {
    date: `${currentQuarterEstimateDate}${currentQuarterEstimateYear}`,
    estimate: currentQuarterEstimate,
  };

  // Determine max & min for the reference markers
  const allVals = quarterly.flatMap((d) => [d.actual, d.estimate]);
  const maxY = Math.max(...allVals);
  const minY = Math.min(...allVals);
  const offset = (maxY - minY) * 0.1;

  // Build reference markers
  const referenceData = quarterly.map((d) => ({
    date: d.date,
    marker: maxY + offset,
    hit: d.actual >= d.estimate,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <defs>
            <pattern
              id="diagonalPattern"
              patternUnits="userSpaceOnUse"
              width={4}
              height={4}
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="4"
                stroke="var(--chart-orange)"
                strokeOpacity={0.5}
                strokeWidth={4}
              />
            </pattern>
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
            domain={["dataMin", "dataMax"]}
            padding={{ top: 20, bottom: 20 }}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 12,
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
          />
          <CartesianGrid
            syncWithTicks
            vertical={false}
            stroke="var(--color-border)"
          />

          <Tooltip cursor={false} content={<CustomTooltip />} />

          {/* actual vs estimate */}
          <Scatter
            name="Actual"
            data={quarterly}
            dataKey="actual"
            shape={CustomActualCircle}
          />
          <Scatter
            name="Estimate"
            data={quarterly}
            dataKey="estimate"
            shape={CustomEstimateCircle}
          />
          <Scatter
            name="Current Estimate"
            data={[currentPoint]}
            dataKey="estimate"
            shape={CustomEstimateCircle}
          />
          {/* reference “hit/miss” markers */}
          <Scatter
            name="Reference"
            data={referenceData}
            dataKey="marker"
            shape={CustomReferenceTriangle}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
