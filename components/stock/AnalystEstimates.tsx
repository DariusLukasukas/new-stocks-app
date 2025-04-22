import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import StockRadarChart from "../charts/StockRadarChart";
import { StockData } from "@/types/yahooFinance";

interface AnalystEstimatesProps {
  data: StockData;
  className?: string;
}

export default function AnalystEstimates({
  data,
  className,
}: AnalystEstimatesProps) {
  const trend = data.recommendationTrend;
  if (!trend) {
    return <div>No data</div>;
  }

  const current = trend.trend.find((item) => item.period === "0m");

  let verdict: string;
  if (!current) {
    verdict = "No verdict available";
  } else {
    const positive = current.strongBuy + current.buy;
    const negative = current.strongSell + current.sell;
    verdict =
      positive > negative
        ? "Optimistic"
        : positive < negative
          ? "Pessimistic"
          : "Neutral";
  }

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle>Analyst ratings</CardTitle>
        <CardDescription
          className={cn(
            "font-medium",
            verdict === "Optimistic" && "text-green-500",
            verdict === "Pessimistic" && "text-red-500",
          )}
        >
          {verdict}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <StockRadarChart trend={trend} />
      </CardContent>
    </Card>
  );
}
