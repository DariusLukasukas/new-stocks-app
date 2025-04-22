import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StockLineChart from "@/components/charts/StockLineChart";
import { cn } from "@/lib/utils";
import { getStockChartData } from "@/app/stock/[ticker]/actions";
import {
  FinancialData,
  PriceData,
  StockChartData,
  StockData,
} from "@/types/yahooFinance";

/** Calculate upside in percent */
function calculateUpside(current: number, target: number): number {
  return ((target - current) / current) * 100;
}

/** Format USD */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

interface PriceTargetProps {
  data: StockData;
  ticker: string;
  className?: string;
}

export default async function PriceTarget({
  data,
  ticker,
  className,
}: PriceTargetProps) {
  const chartData: StockChartData = await getStockChartData(ticker, "1y");

  const fd: FinancialData | undefined = data.financialData;
  if (!fd) return <div>No target price data</div>;

  const { targetHighPrice, targetLowPrice, targetMedianPrice } = fd;
  if (
    targetHighPrice == null ||
    targetLowPrice == null ||
    targetMedianPrice == null
  ) {
    return <div>No complete target price data</div>;
  }

  const pd: PriceData | undefined = data.price;
  if (!pd || pd.regularMarketPrice == null) {
    return <div>No current price data</div>;
  }
  const current = pd.regularMarketPrice;
  const upside = calculateUpside(current, targetHighPrice);

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle>Price target</CardTitle>
        <CardDescription
          className={cn(
            "font-medium",
            upside > 0 ? "text-green-500" : "text-red-500",
          )}
        >
          {formatPrice(current)} (+
          {upside.toFixed(2)}% potential)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <StockLineChart
          chartData={chartData}
          targetHighPrice={targetHighPrice}
          targetLowPrice={targetLowPrice}
          targetMedianPrice={targetMedianPrice}
        />
      </CardContent>
    </Card>
  );
}
