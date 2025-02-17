"use client";

import { ChartData } from "@/app/stock/[ticker]/page";
import React from "react";
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
  time: number; // Unix timestamp in milliseconds
  name: string; // Formatted time string for display
  price: number | null;
  forecastHigh: number | null;
  forecastLow: number | null;
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
  chartData,
}: {
  targetHighPrice: number;
  targetLowPrice: number;
  chartData: ChartData;
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

    const forecastTime = lastQuoteDate.getTime() + i * intervalMs;
    const dt = new Date(forecastTime);

    forecastPoints.push({
      time: forecastTime,
      name: dt.toLocaleTimeString(),
      price: null,
      forecastHigh: forecastHighVal,
      forecastLow: forecastLowVal,
    });
  }

  // Combine actual and forecast data (they should already be in time order).
  const fullData: DataPoint[] = [...realData, ...forecastPoints];

  // Use the very last forecast point for the reference dots.
  const lastForecastPoint = forecastPoints[forecastPoints.length - 1];

  console.log(lastPrice);
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={fullData}
          margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
        >
          <XAxis
            hide
            dataKey="time"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />

          <ReferenceDot
            x={lastForecastPoint.time}
            y={lastForecastPoint.forecastHigh as number}
            r={6}
            fill="var(--chart-2)"
            stroke="none"
            ifOverflow="extendDomain"
            xAxisId={0}
            yAxisId={0}
            shape={(props) => {
              const { cx, cy } = props;
              return <circle cx={cx} cy={cy} r={6} fill="var(--chart-2)" />;
            }}
            label={{
              value: `$${targetHighPrice}`,
              position: "right",
              fill: "var(--muted-foreground)",
              fontSize: 14,
              fontWeight: "bold",
            }}
          />

          <ReferenceDot
            x={lastForecastPoint.time}
            y={lastForecastPoint.forecastLow as number}
            r={6}
            fill="var(--destructive)"
            stroke="none"
            ifOverflow="extendDomain"
            xAxisId={0}
            yAxisId={0}
            shape={(props) => {
              const { cx, cy } = props;
              return <circle cx={cx} cy={cy} r={6} fill="var(--destructive)" />;
            }}
            label={{
              value: `$${targetLowPrice}`,
              position: "right",
              fill: "var(--muted-foreground)",
              fontSize: 14,
              fontWeight: "bold",
            }}
          />

          {/* Horizontal reference line for current price */}
          <ReferenceLine
            y={lastPrice}
            stroke="var(--border)"
            ifOverflow="extendDomain"
            label={{
              value: `$${lastPrice.toFixed(2)}`,
              position: "right",
              fill: "var(--card-foreground)",
              fontSize: 14,
              fontWeight: "bold",
            }}
            className="z-0"
          />
          {/* Second ReferenceLine just for the left label */}
          <ReferenceLine
            y={lastPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              const offsetX = viewBox.x + 10;
              const offsetY = viewBox.y - 5;
              return (
                <text
                  x={offsetX}
                  y={offsetY}
                  fill="var(--card-foreground)"
                  fontSize={14}
                  fontWeight="bold"
                >
                  Current price
                </text>
              );
            }}
            className="z-0"
          />

          <ReferenceLine
            y={targetHighPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              const offsetX = viewBox.x + 10;
              const offsetY = viewBox.y;
              return (
                <text
                  x={offsetX}
                  y={offsetY}
                  fill="var(--chart-2)"
                  fontSize={14}
                  fontWeight="bold"
                >
                  High
                </text>
              );
            }}
          />

          <ReferenceLine
            y={targetLowPrice}
            stroke="none"
            ifOverflow="extendDomain"
            label={({ viewBox }) => {
              const offsetX = viewBox.x + 10;
              const offsetY = viewBox.y;
              return (
                <text
                  x={offsetX}
                  y={offsetY}
                  fill="var(--destructive)"
                  fontSize={14}
                  fontWeight="bold"
                >
                  Low
                </text>
              );
            }}
          />

          {/* Forecast Low line */}
          <Line
            type="monotone"
            dataKey="forecastLow"
            stroke="var(--destructive)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            className="z-50"
          />

          {/* Forecast High line */}
          <Line
            type="monotone"
            dataKey="forecastHigh"
            stroke="var(--chart-2)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
          />

          {/* Actual price line */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-primary)"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
