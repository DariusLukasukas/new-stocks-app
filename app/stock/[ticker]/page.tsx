import StockAreaChart from "@/components/charts/StockAreaChart";
import { getInterval, getPeriod1 } from "@/lib/chartUtils";
import yahooFinance from "yahoo-finance2";

async function getStockChartData(ticker: string, range: string = "1w") {
  const queryOptions = {
    period1: getPeriod1(range),
    period2: new Date().toISOString().split("T")[0],
    interval: getInterval(range) as "1m" | "15m" | "30m" | "60m" | "1d",
  };
  const result = await yahooFinance.chart(ticker, queryOptions);
  return result;
}

export type ChartData = Awaited<ReturnType<typeof getStockChartData>>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { ticker } = await params;
  const { range = "1w" } = await searchParams;

  const chartData = await getStockChartData(ticker, range as string);

  return (
    <div className="container mx-auto">
      <StockAreaChart data={chartData} />
    </div>
  );
}
