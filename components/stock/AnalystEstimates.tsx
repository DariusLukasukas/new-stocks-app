import yahooFinance from "yahoo-finance2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import StockRadarChart from "../charts/StockRadarChart";
import { cn } from "@/lib/utils";

async function getStockData(ticker: string) {
  return yahooFinance.quoteSummary(ticker, {
    modules: ["recommendationTrend"],
  });
}

export type RadarChartData = Awaited<ReturnType<typeof getStockData>>;

export default async function AnalystEstimates({
  ticker = "AAPL",
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const data = await getStockData(ticker);

  if (!data.recommendationTrend) {
    return <div>No data</div>;
  }

  const currentTrend = data.recommendationTrend?.trend?.find(
    (item) => item.period === "0m", // current month
  );

  let verdict = "No verdict available";

  if (currentTrend) {
    const positiveCount = currentTrend.strongBuy + currentTrend.buy;
    const negativeCount = currentTrend.strongSell + currentTrend.sell;

    if (positiveCount > negativeCount) {
      verdict = "Optimistic";
    } else if (positiveCount < negativeCount) {
      verdict = "Pessimistic";
    } else {
      verdict = "Neutral";
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle>Analyst ratings</CardTitle>
        <CardDescription
          className={cn(
            "font-medium",
            verdict == "Optimistic" && "text-green-500",
            verdict == "Pessimistic" && "text-red-500",
          )}
        >
          {verdict}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <StockRadarChart data={data} />
      </CardContent>
    </Card>
  );
}
