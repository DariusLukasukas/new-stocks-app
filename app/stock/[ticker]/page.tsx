import { getInterval, getPeriod1 } from "@/lib/chartUtils";
import yahooFinance from "yahoo-finance2";
import stockData from "@/data/dummy.json";
import StockAreaChart from "@/components/charts/StockAreaChart";
import { cn } from "@/lib/utils";
import PriceSection from "@/components/stock/PriceSection";

async function getStockChartData(ticker: string, range: string = "1w") {
  const queryOptions = {
    period1: getPeriod1(range),
    period2: new Date()
      .toLocaleString("en-US", { timeZone: "America/New_York" })
      .split("T")[0],
    interval: getInterval(range) as DEFAULT_INTERVALS,
  };
  const result = await yahooFinance.chart(ticker, queryOptions);
  return result;
}

async function getStockData(ticker: string) {
  try {
    const result = await yahooFinance.quote(ticker);
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}
// export type ChartData = Awaited<ReturnType<typeof getStockChartData>>;
export type DEFAULT_INTERVALS = "1m" | "15m" | "30m" | "60m" | "1d";

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

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
  // const stockData = await getStockData(ticker);
  return (
    <div className="container mx-auto">
      <div>
        <div className="flex gap-2">
          <span className="font-bold text-xl">{stockData.symbol}</span>
          <span className="text-xl font-medium text-muted-foreground">
            {stockData.longName}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-fit">
          <PriceSection
            label="After hours"
            price={stockData.regularMarketPrice}
            change={stockData.regularMarketChange}
            changePercent={stockData.regularMarketChangePercent}
          />
          <PriceSection
            label="Pre-market"
            price={stockData.postMarketPrice}
            change={stockData.postMarketChange}
            changePercent={stockData.postMarketChangePercent}
          />
        </div>
      </div>
      <StockAreaChart data={chartData} />
    </div>
  );
}
