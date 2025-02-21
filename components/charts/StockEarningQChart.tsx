"use client";

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
import { EarningsData } from "../stock/Earnings";
import { Props } from "recharts/types/shape/Dot";

const CustomActualCircle = (props: Props) => {
  const { cx, cy, r = 12 } = props;
  return <circle cx={cx} cy={cy} r={r} fill={"var(--color-primary)"} />;
};

const CustomEstimateCircle = (props: Props) => {
  const { cx, cy, r = 12 } = props;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="url(#diagonalPattern)"
      stroke={"var(--chart-orange)"}
      strokeWidth={2}
      strokeDasharray="3 3"
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomReferenceTriangle = (props: any) => {
  const { cx, cy, r = 8, payload } = props;

  const hit = payload && payload.hit;
  const fill = hit ? "var(--chart-green)" : "var(--chart-red)";

  const points = hit
    ? `${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`
    : `${cx - r},${cy - r} ${cx + r},${cy - r} ${cx},${cy + r}`;

  const labelText = hit ? "beat" : "missed";
  // Place the text above the triangle: top of triangle is at (cy - r).
  const textOffset = 6;
  const textY = cy - r - textOffset;

  return (
    <g style={{ pointerEvents: "none" }}>
      <polygon points={points} fill={fill} />
      <text
        x={cx}
        y={textY}
        textAnchor="middle"
        fill={fill}
        fontSize={12}
        fontWeight="bold"
      >
        {labelText}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-white/5 p-2 text-sm font-medium shadow-md backdrop-blur-sm">
        <p className="text-primary">
          {payload[0].payload.actual && (
            <span>Actual: ${payload[0].payload.actual}</span>
          )}
        </p>
        <p className="text-(--chart-orange)">
          <span>Estimate: </span>${payload[0].payload.estimate.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function StockEarningQChart({ data }: { data: EarningsData }) {
  if (!data.earnings) {
    return <div>No data available</div>;
  }
  const {
    quarterly,
    currentQuarterEstimate,
    currentQuarterEstimateDate,
    currentQuarterEstimateYear,
  } = data.earnings.earningsChart;

  const currentEstimatePoint = {
    date: `${currentQuarterEstimateDate}${currentQuarterEstimateYear}`,
    estimate: currentQuarterEstimate,
  };

  // Compute all values from quarterly data.
  const allValues = quarterly.reduce((acc: number[], d) => {
    return acc.concat(d.actual, d.estimate);
  }, [] as number[]);
  const maxY = Math.max(...allValues);
  const minY = Math.min(...allValues);
  // Calculate an offset: 10% of the data range.
  const offset = (maxY - minY) * 0.1;

  // Build reference data: for each quarter, add a marker with y = maxY and a hit flag.
  const referenceData = quarterly.map((d) => ({
    date: d.date,
    marker: maxY + offset,
    hit: d.actual >= d.estimate,
  }));

  return (
    <div style={{ width: "100%", height: 400 }} className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <defs>
            <pattern
              id="diagonalPattern"
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="4"
                stroke="var(--chart-orange)"
                strokeOpacity={0.5}
                strokeWidth="4"
              />
            </pattern>
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
            domain={["dataMin", "dataMax"]}
            padding={{ top: 20, bottom: 20 }}
            scale={"linear"}
            tickFormatter={(value: number) => `$${value.toFixed(2)}`}
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 12,
              fontWeight: "500",
            }}
          />
          <CartesianGrid
            syncWithTicks
            vertical={false}
            stroke="var(--color-border)"
          />
          <Tooltip cursor={false} content={<CustomTooltip />} />

          <Scatter
            name="Estimate"
            data={quarterly}
            dataKey="estimate"
            shape={(props: Props) => <CustomEstimateCircle {...props} />}
          />
          <Scatter
            name="Current Estimate"
            data={[currentEstimatePoint]}
            dataKey="estimate"
            shape={(props: Props) => <CustomEstimateCircle {...props} />}
          />
          <Scatter
            name="Actual"
            data={quarterly}
            dataKey="actual"
            shape={CustomActualCircle}
          />
          <Scatter
            name="Reference"
            data={referenceData}
            dataKey="marker"
            shape={(props: Props) => <CustomReferenceTriangle {...props} />}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
