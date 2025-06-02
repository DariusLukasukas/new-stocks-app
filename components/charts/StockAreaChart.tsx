"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ChartData } from "@/app/dashboard/stock/[ticker]/page";
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  ComposedChart,
  // Bar,
  ReferenceDot,
  ReferenceDotProps,
} from "recharts";
import Range from "./Range";

export const RANGE_OPTIONS = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "1Y", value: "1y" },
];

/**
 * Custom SVG shape for the pulsing dot.
 */
interface PulsingDotProps extends ReferenceDotProps {
  color?: string;
}

const PulsingDot = ({
  cx,
  cy,
  color = "var(--chart-blue)",
}: PulsingDotProps) => (
  <g>
    {/* inner circle */}
    <circle cx={cx} cy={cy} r={4} fill={color} />
    {/* pulsing ring */}
    <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={2}>
      <animate
        attributeName="r"
        from="5"
        to="10"
        dur="2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        from="1"
        to="0"
        dur="2s"
        begin="0.5s"
        repeatCount="indefinite"
      />
    </circle>
  </g>
);

/**
 * Formats a Date for the X-Axis tick labels.
 * For a 1D chart, we display Eastern time (hour:minute).
 */
function formatXAxisTick(date: Date, range: string): string {
  if (range === "1d") {
    return date.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
    });
  } else if (range === "1w" || range === "1m") {
    return date.getDate().toString();
  } else if (range === "3m" || range === "1y") {
    return date
      .toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .replace(/,/g, "");
  }
  return date.toISOString().split("T")[0];
}

/**
 * Formats a Date for the Tooltip label.
 */
function formatTooltipLabel(date: Date, range: string): string {
  if (range === "1d") {
    return date
      .toLocaleString("en-US", {
        timeZone: "America/New_York",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
      .replace(/,/g, "");
  } else {
    return date
      .toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        day: "2-digit",
        month: "short",
        year: "numeric",
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
    const { value: price, color } = payload[0];
    return (
      <div className="bg-glass-background-primary text-glass-text-primary rounded-xl px-4 py-2 text-sm leading-8 font-semibold shadow-md backdrop-blur-xl">
        <div className="flex items-center">
          <div
            style={{
              backgroundColor: color,
            }}
            className="mr-1 inline-block h-4 w-1 rounded-t-sm rounded-b-sm"
          />
          <p>Price: </p>
          <p className="font-nunito ml-1 font-bold">{formatPrice(price!)}</p>
        </div>
        <p className="text-glass-text-secondary">{dateLabel}</p>
      </div>
    );
  }
  return null;
};

interface ChartProps {
  data: ChartData;
  showDates?: boolean;
  showRange?: boolean;
  showChartGradient?: boolean;
}

export default function StockAreaChart({
  data,
  showDates = true,
  showRange = true,
  showChartGradient = true,
}: ChartProps) {
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "1w";

  // --- ADJUSTING TIMESTAMPS ---
  const rawData = data.quotes
    .filter((quote) => quote.close !== null)
    .map((quote) => ({
      date: quote.date.getTime(),
      close: quote.close!,
      volume: quote.volume || 0,
    }));

  // --- X-AXIS TICKS ---
  const defaultXTicks = useMemo(() => {
    if (rawData.length === 0) return [];
    const desiredTickCount = 5;
    const tickInterval = Math.max(
      1,
      Math.ceil(rawData.length / desiredTickCount),
    );
    return rawData
      .filter((_, index) => index % tickInterval === 0)
      .map((item) => item.date);
  }, [rawData]);

  // --- MARKET STATUS ---
  const isMarketOpen = useMemo(() => {
    const nowET = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    );
    const totalMinutes = nowET.getHours() * 60 + nowET.getMinutes();
    return totalMinutes >= 570 && totalMinutes < 960; // 9:30 = 570, 16:00 = 960
  }, []);

  // --- CURRENT DATA POINT ---
  const currentDataPoint = useMemo(() => {
    if (isMarketOpen && rawData.length > 0) {
      return rawData[rawData.length - 1];
    }
    return null;
  }, [isMarketOpen, rawData]);

  const startPrice = rawData[0]?.close ?? 0;
  // if market is open AND you have a live point, otherwise fall back to the last quote
  const endPrice =
    isMarketOpen && currentDataPoint
      ? currentDataPoint.close
      : (rawData[rawData.length - 1]?.close ?? 0);

  const isUp = endPrice >= startPrice;
  const strokeColor = isUp ? "var(--chart-green)" : "var(--chart-red)";

  return (
    <div className="flex flex-col gap-2">
      <div
        style={{ width: "100%", height: 416 }}
        className="relative select-none"
      >
        {/* DOTS */}
        <div className="absolute inset-0 h-full w-full bg-[radial-gradient(var(--color-muted-foreground)_0.5px,transparent_0.5px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] [background-size:17px_17px] dark:opacity-80" />

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rawData} margin={{ top: 5, right: 10 }}>
            {showChartGradient && (
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  {/* 100% opaque at the very top */}
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={1} />
                  {/* fully transparent at the bottom */}
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}

            {showDates && (
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                ticks={defaultXTicks}
                domain={defaultXTicks}
                tickFormatter={(value) =>
                  formatXAxisTick(new Date(value), range)
                }
                className="text-text-tertiary font-nunito text-sm font-bold"
              />
            )}
            <YAxis
              yAxisId="price"
              tick={false}
              axisLine={false}
              width={0}
              domain={["dataMin", "dataMax"]}
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
                className: "stroke-primary/20",
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
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#areaGradient)"
            />
            {isMarketOpen && currentDataPoint && (
              <ReferenceDot
                xAxisId="0"
                yAxisId="price"
                x={currentDataPoint.date}
                y={currentDataPoint.close}
                r={6}
                shape={<PulsingDot color={strokeColor} />}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {showRange && <Range RANGE_OPTIONS={RANGE_OPTIONS} />}
    </div>
  );
}
