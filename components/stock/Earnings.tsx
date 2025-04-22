import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StockEarningQChart from "@/components/charts/StockEarningQChart";
import type {
  StockData,
  EarningsChart,
  QuarterlyEarningsPoint,
  EarningsModule,
} from "@/types/yahooFinance";

interface EarningsProps {
  data: StockData;
  className?: string;
}

function calculateEPSChange(
  currentEstimate: number,
  quarterly: QuarterlyEarningsPoint[],
): { epsText: string; colorClass: string } {
  const last = quarterly[quarterly.length - 1].actual;
  if (last == null) {
    return { epsText: "EPS forecast unavailable", colorClass: "" };
  }
  const change = ((currentEstimate - last) / last) * 100;
  const pct = Math.abs(Math.round(change));
  const up = change >= 0;
  return {
    epsText: `EPS forecast ${up ? "up" : "down"} by ${pct}%`,
    colorClass: up ? "text-green-500" : "text-red-500",
  };
}

export default function Earnings({ data, className }: EarningsProps) {
  const em: EarningsModule | undefined = data.earnings;
  if (!em?.earningsChart) {
    return <div>No data available</div>;
  }

  const chart: EarningsChart = em.earningsChart;
  const { quarterly, currentQuarterEstimate } = chart;

  if (!quarterly?.length || currentQuarterEstimate == null) {
    return <div>No quarterly earnings data available</div>;
  }

  const { epsText, colorClass } = calculateEPSChange(
    currentQuarterEstimate,
    quarterly,
  );

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle>Earnings per share</CardTitle>
        <CardDescription className={cn("font-medium", colorClass)}>
          {epsText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StockEarningQChart chart={chart} />
      </CardContent>
    </Card>
  );
}
