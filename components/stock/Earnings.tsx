import yahooFinance from "yahoo-finance2";
import StockEarningQChart from "../charts/StockEarningQChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";

async function getEarnings({ ticker }: { ticker: string }) {
  "use cache";
  const data = await yahooFinance.quoteSummary(ticker, {
    modules: ["earnings"],
  });

  return data;
}

export type EarningsData = Awaited<ReturnType<typeof getEarnings>>;

function calculateEPSChange(
  currentEstimate: number,
  quarterly: { actual: number }[],
): { epsText: string; colorClass: string } {
  const lastEPS = quarterly[quarterly.length - 1].actual;
  if (!lastEPS) {
    return { epsText: "EPS forecast unavailable", colorClass: "" };
  }
  const change = ((currentEstimate - lastEPS) / lastEPS) * 100;
  const roundedChange = Math.abs(Math.round(change));
  const direction = change >= 0 ? "up" : "down";
  const epsText = `EPS forecast ${direction} by ${roundedChange}%`;
  const colorClass = direction === "up" ? "text-green-500" : "text-red-500";
  return { epsText, colorClass };
}

export default async function Earnings({
  ticker = "AAPL",
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const data = await getEarnings({ ticker });

  if (!data || !data.earnings) {
    return <div>No data available</div>;
  }

  const { currentQuarterEstimate, quarterly } = data.earnings.earningsChart;

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
        <StockEarningQChart data={data} />
      </CardContent>
    </Card>
  );
}
