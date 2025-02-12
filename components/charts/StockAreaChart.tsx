"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChartData } from "@/app/stock/[ticker]/page";
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";

interface ChartProps {
  data: ChartData;
}

const RANGE_OPTIONS = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "1Y", value: "1y" },
];

/**
 * Formats a Date for the X-Axis tick labels.
 * - For "1d": Returns only the hour (e.g. "10").
 * - For "1w" and "1m": Returns the day of month (e.g. "10").
 * - For "3m" and "1y": Returns abbreviated month, day and year (e.g. "Apr 13 2024").
 */
function formatXAxisTick(date: Date, range: string): string {
  if (range === "1d") {
    return date.getHours().toString();
  } else if (range === "1w" || range === "1m") {
    return date.getDate().toString();
  } else if (range === "3m" || range === "1y") {
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })
      .replace(/,/g, "");
  }
  return date.toISOString().split("T")[0];
}

/**
 * Formats a Date for the Tooltip label.
 * - For "1d": Returns the full date and time in the format "11 Feb 2025 at 20:25".
 * - For other ranges: Returns just the date in the format "11 Feb 2025".
 */
function formatTooltipLabel(date: Date, range: string): string {
  if (range === "1d") {
    const datePart = date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/New_York",
      })
      .replace(/,/g, "");
    const hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return `${datePart} at ${hours}:${minutes}`;
  } else {
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/New_York",
      })
      .replace(/,/g, "");
  }
}

/**
 * Formats a number as US dollars.
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Custom Tooltip component that applies Tailwind classes for styling.
 * It displays the formatted date and the Price (formatted as dollars).
 */
interface CustomTooltipProps extends TooltipProps<number, string> {
  range: string;
}
const CustomTooltip = ({
  active = false,
  payload,
  label,
  range,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dateLabel = formatTooltipLabel(new Date(label), range);
    const price = payload[0].value;
    return (
      <div className="bg-white/5 p-2 rounded-md shadow-md border backdrop-blur-sm text-sm text-primary font-medium">
        <div>{dateLabel}</div>
        <div>Price: {formatPrice(price!)}</div>
      </div>
    );
  }
  return null;
};

export default function StockAreaChart({ data }: ChartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "1w";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const rangeData = useMemo(() => {
    return data.quotes
      .filter((quote) => quote.close !== null)
      .map((quote) => ({
        date: new Date(quote.date).getTime(),
        close: quote.close!,
        volume: quote.volume || 0,
      }));
  }, [data.quotes]);

  // Limit the number of ticks on the x-axis (approx. 5 evenly spaced ticks)
  const xTicks = useMemo(() => {
    if (rangeData.length === 0) return [];
    const desiredTickCount = 5;
    const tickInterval = Math.max(
      1,
      Math.ceil(rangeData.length / desiredTickCount)
    );
    return rangeData
      .filter((_, index) => index % tickInterval === 0)
      .map((item) => item.date);
  }, [rangeData]);

  return (
    <>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rangeData}
            margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
            className="font-mono"
          >
            <defs>
              {/* Gradient definitions (you can use these if desired) */}
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
              {/* Example pattern: 45° diagonal lines */}
              {/* <pattern
                  id="diagonalLines"
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
                    strokeWidth="2"
                    className="stroke-primary/10"
                  />
                </pattern> */}
              {/* Example pattern: dots (uncomment to use)
                <pattern id="dotsPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                  <circle cx="2" cy="2" r="1" fill="#8884d8" />
                </pattern>
                */}
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              ticks={xTicks}
              tickFormatter={(value) => formatXAxisTick(new Date(value), range)}
              className="text-sm font-medium"
            />
            <YAxis
              yAxisId="price"
              tick={false}
              axisLine={false}
              width={0}
              domain={["dataMin", "dataMax"]}
              padding={{ bottom: 60 }}
            />
            <YAxis
              hide
              type="number"
              yAxisId="volume"
              orientation="right"
              domain={[0, (dataMax: number) => dataMax * 5]}
            />
            <Tooltip<number, string>
              cursor={{
                strokeWidth: 1,
                strokeDasharray: "5 5",
                className: "stroke-primary/50",
              }}
              content={({ active, payload, label }) => (
                <CustomTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  range={range}
                />
              )}
            />
            {/* Possible to choose the fill style for the area:
                  - Use the gradient: fill="url(#colorHigh)"
                  - Or use the pattern: fill="url(#diagonalLines)" or fill="url(#dotsPattern)"
              */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#8884d8"
              strokeWidth={1.5}
              fillOpacity={1}
              // fill="url(#diagonalLines)"
              fill="url(#colorHigh)"
            />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fillOpacity={0.2}
              fill="#413ea0"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex space-x-2">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.label}
            size="icon"
            variant="outline"
            disabled={range === option.value}
            onClick={() => {
              router.push(
                pathname + "?" + createQueryString("range", option.value)
              );
            }}
            className="select-none"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </>
  );
}
