"use client";

import { StockChartData } from "@/types/yahooFinance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from "recharts";

export interface DataPoint {
  time: number;
  name: string;
  price: number | null;
  forecastHigh: number | null;
  forecastLow: number | null;
  forecastMedian?: number | null;
}

/**
 * Easing function for interpolation.
 * For t in [0,1], returns t^2.
 */
function easeInQuad(t: number): number {
  return t * t;
}

export default function StockLineChart({
  targetHighPrice,
  targetLowPrice,
  targetMedianPrice,
  chartData,
}: {
  targetHighPrice: number;
  targetLowPrice: number;
  targetMedianPrice: number;
  chartData: StockChartData;
}) {
  if (!chartData || !chartData.quotes || chartData.quotes.length === 0) {
    return <div>No chart data available</div>;
  }
  const quotes = chartData.quotes;

  const realData: DataPoint[] = quotes.map((quote) => {
    const dt = new Date(quote.date);
    return {
      time: dt.getTime(),
      name: dt.toLocaleTimeString(),
      price: quote.close,
      forecastHigh: null,
      forecastLow: null,
      forecastMedian: null,
    };
  });

  // Use the last real quote as the anchor.
  const lastRealData = realData[realData.length - 1];
  const lastPrice = lastRealData.price as number;
  const lastQuoteDate = new Date(quotes[quotes.length - 1].date);

  // Determine the interval between quotes (in milliseconds).
  const intervalMs =
    quotes.length > 1
      ? new Date(quotes[quotes.length - 1].date).getTime() -
        new Date(quotes[quotes.length - 2].date).getTime()
      : 60000; // default to 1 minute if only one quote

  // Choose how many forecast points to display.
  const forecastCount = quotes.length;

  // Generate forecast points with numeric time.
  const forecastPoints: DataPoint[] = [];
  for (let i = 1; i <= forecastCount; i++) {
    const fraction = i / forecastCount;
    const easedFrac = easeInQuad(fraction);
    const forecastHighVal =
      lastPrice + (targetHighPrice - lastPrice) * easedFrac;
    const forecastLowVal = lastPrice + (targetLowPrice - lastPrice) * easedFrac;
    const forecastMedianVal =
      lastPrice + (targetMedianPrice - lastPrice) * easedFrac;
    const forecastTime = lastQuoteDate.getTime() + i * intervalMs;
    const dt = new Date(forecastTime);

    forecastPoints.push({
      time: forecastTime,
      name: dt.toLocaleTimeString(),
      price: null,
      forecastHigh: forecastHighVal,
      forecastLow: forecastLowVal,
      forecastMedian: forecastMedianVal,
    });
  }

  // Combine actual and forecast data (they should already be in time order).
  const fullData: DataPoint[] = [...realData, ...forecastPoints];
  // Use the very last forecast point for the reference dots.
  const lastForecastPoint = forecastPoints[forecastPoints.length - 1];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={fullData}
          margin={{ top: 10, right: 80, left: 0, bottom: 20 }}
        >
          <XAxis
            hide
            dataKey="time"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            padding={{ left: 100 }}
          />
          <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
          {/* Step 1: Define gradients for each forecast line you want to style */}
          <defs>
            {/* ForecastLow: left white → right red */}
            <linearGradient
              id="forecastLowGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-red)"
                stopOpacity={1}
              />
            </linearGradient>
            {/* ForecastHigh: left white → right green */}
            <linearGradient
              id="forecastHighGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-green)"
                stopOpacity={1}
              />
            </linearGradient>
            {/* ForecastMedian: left white → right orange */}
            <linearGradient
              id="forecastMedianGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-orange)"
                stopOpacity={1}
              />
            </linearGradient>
          </defs>
          {/* Target High Reference */}
          <ReferenceDot
            x={lastForecastPoint.time}
            y={lastForecastPoint.forecastHigh as number}
            r={6}
            fill="var(--chart-green)"
            stroke="none"
            ifOverflow="extendDomain"
            xAxisId={0}
            yAxisId={0}
            shape={({ cx, cy }) => (
              <circle cx={cx} cy={cy} r={1} fill="var(--chart-green)" />
            )}
            label={{
              value: `$${targetHighPrice}`,
              textAnchor: "start",
              position: "right",
              fill: "var(--chart-green)",
              fontSize: 16,
              fontWeight: "600",
            }}
          />
          {/* Target Low Reference */}
          <ReferenceDot
            x={lastForecastPoint.time}
            y={lastForecastPoint.forecastLow as number}
            r={6}
            fill="var(--chart-red)"
            stroke="none"
            ifOverflow="extendDomain"
            xAxisId={0}
            yAxisId={0}
            shape={({ cx, cy }) => (
              <circle cx={cx} cy={cy} r={1} fill="var(--chart-red)" />
            )}
            label={{
              value: `$${targetLowPrice}`,
              textAnchor: "start",
              position: "right",
              fill: "var(--chart-red)",
              fontSize: 16,
              fontWeight: "600",
            }}
          />
          {/* Target Median Reference */}
          <ReferenceDot
            x={lastForecastPoint.time}
            y={lastForecastPoint.forecastMedian as number}
            r={6}
            fill="var(--chart-orange)"
            stroke="none"
            ifOverflow="extendDomain"
            xAxisId={0}
            yAxisId={0}
            shape={({ cx, cy }) => (
              <circle cx={cx} cy={cy} r={1} fill="var(--chart-orange)" />
            )}
            label={{
              value: `$${targetMedianPrice}`,
              textAnchor: "start",
              position: "right",
              fill: "var(--chart-orange)",
              fontSize: 16,
              fontWeight: "600",
            }}
          />
          {/* Horizontal reference line for current price */}
          <ReferenceLine
            y={lastPrice}
            stroke="var(--unique-background-glass-badge)"
            strokeWidth={2}
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
            label={{
              value: `$${lastPrice.toFixed(2)}`,
              textAnchor: "start",
              position: "right",
              fill: "var(--color-primary)",
              fontSize: 16,
              fontWeight: "600",
            }}
          />
          {/* Second ReferenceLine just for the left label */}
          <ReferenceLine
            y={lastPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              return (
                <text
                  y={viewBox.y - 5}
                  fill="var(--card-foreground)"
                  fontSize={16}
                  fontWeight="600"
                >
                  Current price
                </text>
              );
            }}
          />
          {/* High Label */}
          <ReferenceLine
            y={targetHighPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              return (
                <text
                  y={viewBox.y}
                  fill="var(--chart-green)"
                  fontSize={16}
                  fontWeight="600"
                >
                  High
                </text>
              );
            }}
          />
          {/* Low Label */}
          <ReferenceLine
            y={targetLowPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              return (
                <text
                  y={viewBox.y}
                  fill="var(--chart-red)"
                  fontSize={16}
                  fontWeight="600"
                >
                  Low
                </text>
              );
            }}
          />
          {/* Median Label */}
          <ReferenceLine
            y={targetMedianPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              return (
                <text
                  y={viewBox.y}
                  fill="var(--chart-orange)"
                  fontSize={16}
                  fontWeight="600"
                >
                  Median
                </text>
              );
            }}
          />

          {/* Forecast Low line with gradient stroke */}
          <Line
            type="monotone"
            dataKey="forecastLow"
            stroke="url(#forecastLowGradient)"
            strokeWidth={2}
            dot={false}
          />
          {/* Forecast High line with gradient stroke */}
          <Line
            type="monotone"
            dataKey="forecastHigh"
            stroke="url(#forecastHighGradient)"
            strokeWidth={2}
            dot={false}
          />
          {/* Forecast Median line with gradient stroke */}
          <Line
            type="monotone"
            dataKey="forecastMedian"
            stroke="url(#forecastMedianGradient)"
            strokeWidth={2}
            dot={false}
          />
          {/* Actual price line (no gradient; stays solid) */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
