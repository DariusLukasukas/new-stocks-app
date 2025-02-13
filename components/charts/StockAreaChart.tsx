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
  ReferenceDot,
  ReferenceDotProps,
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
 * Custom SVG shape for the pulsing dot.
 */
const PulsingDot = (props: ReferenceDotProps) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r="5" fill="#8884d8" />
      <circle
        cx={cx}
        cy={cy}
        r="5"
        fill="none"
        stroke="#8884d8"
        strokeWidth="2"
      >
        <animate
          attributeName="r"
          from="5"
          to="10"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="1s"
          begin="0.5s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
};

/**
 * Formats a Date for the X-Axis tick labels.
 * For a 1D chart, we display Eastern time (hour:minute).
 */
function formatXAxisTick(date: Date, range: string): string {
  if (range === "1d") {
    return date.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
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
      .toLocaleString("en-GB", {
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
      .toLocaleDateString("en-GB", {
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

  // --- ADJUSTING TIMESTAMPS ---
  const rawData = data.quotes
    .filter((quote) => quote.close !== null)
    .map((quote) => ({
      date: quote.date.getTime(),
      close: quote.close!,
      volume: quote.volume || 0,
    }));

  // --- FILTER DATA FOR 1D ---
  // For a 1D chart, only include today's quotes (Eastern Time).
  const rangeData = useMemo(() => {
    if (range === "1d") {
      // Compute today's midnight in Eastern Time.
      const todayET = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      todayET.setHours(0, 0, 0, 0);
      // Compute market open time (9:30 AM Eastern Time)
      const marketOpenET = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      marketOpenET.setHours(9, 30, 0, 0);
      // Current Eastern time:
      const nowET = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      // If market is open, show only data later than the later of (market open or 8 hours ago)
      const eightHoursAgo = nowET.getTime() - 8 * 60 * 60 * 1000;
      const lowerBound = Math.max(eightHoursAgo, marketOpenET.getTime());
      return rawData.filter(
        (item) => item.date >= Math.max(todayET.getTime(), lowerBound)
      );
    }
    return rawData;
  }, [rawData, range]);

  // --- X-AXIS TICKS ---
  // For non-1D ranges, compute ticks normally.
  const defaultXTicks = useMemo(() => {
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

  // For 1D charts, compute a custom x-axis domain and hourly ticks.
  const xDomain = useMemo(() => {
    if (range === "1d" && rangeData.length > 0) {
      const current = rangeData[rangeData.length - 1].date;
      const eightHoursInMs = 8 * 60 * 60 * 1000;
      // Market open time (already in Eastern Time)
      const marketOpenET = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      marketOpenET.setHours(9, 30, 0, 0);
      const lowerBound = Math.max(
        current - eightHoursInMs,
        marketOpenET.getTime()
      );
      return [lowerBound, current];
    }
    return ["dataMin", "dataMax"];
  }, [range, rangeData]);

  const xTicksCustom = useMemo(() => {
    if (
      range === "1d" &&
      Array.isArray(xDomain) &&
      typeof xDomain[0] === "number" &&
      typeof xDomain[1] === "number"
    ) {
      const start = xDomain[0] as number;
      const end = xDomain[1] as number;
      const oneHour = 60 * 60 * 1000;
      const ticks = [];
      // Round up start to the next whole hour
      const firstTick = Math.ceil(start / oneHour) * oneHour;
      for (let t = firstTick; t <= end; t += oneHour) {
        ticks.push(t);
      }
      return ticks;
    }
    return defaultXTicks;
  }, [range, xDomain, defaultXTicks]);

  // --- MARKET STATUS ---
  const isMarketOpen = useMemo(() => {
    const nowET = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const totalMinutes = nowET.getHours() * 60 + nowET.getMinutes();
    return totalMinutes >= 570 && totalMinutes < 960; // 9:30 = 570, 16:00 = 960
  }, []);

  // --- CURRENT DATA POINT ---
  const currentDataPoint = useMemo(() => {
    if (isMarketOpen && rangeData.length > 0) {
      return rangeData[rangeData.length - 1];
    }
    return null;
  }, [isMarketOpen, rangeData]);

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
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
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
              ticks={range === "1d" ? xTicksCustom : defaultXTicks}
              domain={xDomain}
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
            {/* Possible to choose the fill style for the area:
                  - Use the gradient: fill="url(#colorHigh)"
                  - Or use the pattern: fill="url(#diagonalLines)" or fill="url(#dotsPattern)"
              */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              fillOpacity={1}
              // fill="url(#diagonalLines)"
              fill="url(#colorHigh)"
            />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fillOpacity={0.2}
              fill="var(--color-primary)"
              isAnimationActive={false}
            />
            {isMarketOpen && currentDataPoint && (
              <ReferenceDot
                xAxisId="0"
                yAxisId="price"
                x={currentDataPoint.date}
                y={currentDataPoint.close}
                r={5}
                shape={<PulsingDot />}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex space-x-2">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.label}
            size="icon"
            variant="outline"
            onClick={() => {
              router.push(
                pathname + "?" + createQueryString("range", option.value)
              );
            }}
            disabled={range === option.value}
            className="select-none"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </>
  );
}
