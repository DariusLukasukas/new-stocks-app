import yahooFinance from "yahoo-finance2";
import StockLineChart from "../charts/StockLineChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DEFAULT_INTERVALS } from "@/app/stock/[ticker]/page";
import { getInterval, getPeriod1 } from "@/lib/chartUtils";

async function getStockChartData(ticker: string, range: string = "1y") {
  "use cache";
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
  "use cache";

  return yahooFinance.quoteSummary(ticker, {
    modules: ["price", "financialData"],
  });
}

function calculateUpside(
  currentPrice: number,
  targetHighPrice: number,
): number {
  return ((targetHighPrice - currentPrice) / currentPrice) * 100;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default async function PriceTarget({
  ticker = "AAPL",
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const chartData = await getStockChartData(ticker, "1y");
  const data = await getStockData(ticker);

  if (!data.financialData) {
    return <div>No data</div>;
  }
  const { targetHighPrice, targetLowPrice, targetMedianPrice } =
    data.financialData;

  if (!targetHighPrice || !targetLowPrice || !targetMedianPrice) {
    return <div>No target price data</div>;
  }

  if (!data.price) {
    return <div>No price data</div>;
  }

  const { regularMarketPrice } = data.price;

  if (!regularMarketPrice) {
    return <div>No regular market price data</div>;
  }

  console.log(data);
  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle>Price target</CardTitle>
        <CardDescription>
          {formatPrice(regularMarketPrice)}(
          {`+${calculateUpside(regularMarketPrice, targetHighPrice).toFixed(2)}%`}{" "}
          potential)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <StockLineChart
          targetHighPrice={targetHighPrice}
          targetLowPrice={targetLowPrice}
          targetMedianPrice={targetMedianPrice}
          chartData={chartData}
        />
      </CardContent>
    </Card>
  );
}
