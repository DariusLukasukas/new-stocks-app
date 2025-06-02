import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EarningBarChart from "@/components/charts/EarningBarChart";
import { QuarterlyDataPoint, StockData } from "@/types/yahooFinance";

interface RevenueEarningsProps {
  data: StockData;
  className?: string;
}

export default function RevenueEarnings({
  data,
  className,
}: RevenueEarningsProps) {
  const earningsModule = data.earnings;
  if (!earningsModule?.financialsChart?.quarterly) {
    return <div>No data available</div>;
  }

  const quarterly: QuarterlyDataPoint[] =
    earningsModule.financialsChart.quarterly;

  // compute last‑vs‑previous changes
  let descContent: React.ReactNode = <span>N/A</span>;

  if (quarterly.length >= 2) {
    const [prev, curr] = quarterly.slice(-2);
    const revChange = Math.round(
      ((curr.revenue - prev.revenue) / prev.revenue) * 100,
    );
    const earnChange = Math.round(
      ((curr.earnings - prev.earnings) / prev.earnings) * 100,
    );

    const revClass = revChange >= 0 ? "text-green-500" : "text-red-500";
    const earnClass = earnChange >= 0 ? "text-green-500" : "text-red-500";

    descContent = (
      <>
        <span className={revClass}>
          Revenue {revChange >= 0 ? "+" : "-"}
          {Math.abs(revChange)}%
        </span>
        <span className="text-text-secondary">{" | "}</span>
        <span className={earnClass}>
          Earnings {earnChange >= 0 ? "+" : "-"}
          {Math.abs(earnChange)}%
        </span>
      </>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle className="text-lg">Revenue vs Earnings</CardTitle>
        <CardDescription className="text-base font-medium">
          {descContent}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EarningBarChart data={quarterly} />
      </CardContent>
    </Card>
  );
}
