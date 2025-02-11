"use client";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChartData } from "@/app/stock/[ticker]/page";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../ui/button";

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

export default function StockAreaChart({ data }: ChartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
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
        date: new Date(quote.date).toISOString().split("T")[0],
        close: Math.round(quote.close! * 100) / 100,
      }));
  }, [data.quotes]);

  const [minClose, maxClose] = useMemo(() => {
    const closes = rangeData.map((item) => item.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const padding = (max - min) * 0.05; // 5% padding on each side
    return [min - padding, max + padding];
  }, [rangeData]);

  return (
    <>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={rangeData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis
              tick={false}
              axisLine={false}
              domain={[minClose, maxClose]}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorHigh)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Range */}
      <div className="flex space-x-2 mt-4">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.label}
            size="icon"
            variant="outline"
            onClick={() => {
              // <pathname>?sort=asc
              router.push(
                pathname + "?" + createQueryString("range", option.value)
              );
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </>
  );
}
