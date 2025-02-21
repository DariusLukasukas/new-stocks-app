import yahooFinance from "yahoo-finance2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import EarningBarChart from "../charts/EarningBarChart";

async function getEarnings({ ticker }: { ticker: string }) {
  "use cache";
  const data = await yahooFinance.quoteSummary(ticker, {
    modules: ["earnings"],
  });
  return data;
}

export type EarningsData = Awaited<ReturnType<typeof getEarnings>>;

export default async function RevenueEarnings({
  ticker,
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const data = await getEarnings({ ticker });

  if (!data || !data.earnings) {
    return <div>No data available</div>;
  }

  const quarterly = data.earnings.financialsChart.quarterly;
  let descContent = <span>N/A</span>;
  if (quarterly && quarterly.length >= 2) {
    const curr = quarterly[quarterly.length - 1];
    const prev = quarterly[quarterly.length - 2];
    const revChange = Math.round(
      ((curr.revenue - prev.revenue) / prev.revenue) * 100,
    );
    const earnChange = Math.round(
      ((curr.earnings - prev.earnings) / prev.earnings) * 100,
    );

    const revenueColorClass =
      revChange >= 0 ? "text-green-500" : "text-red-500";
    const earningsColorClass =
      earnChange >= 0 ? "text-green-500" : "text-red-500";

    descContent = (
      <>
        <span className={revenueColorClass}>
          Revenue {revChange >= 0 ? "+" : "-"}
          {Math.abs(revChange)}%
        </span>
        {" | "}
        <span className={earningsColorClass}>
          Earnings {earnChange >= 0 ? "+" : "-"}
          {Math.abs(earnChange)}%
        </span>
      </>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle>Revenue vs Earnings</CardTitle>
        <CardDescription className="font-medium">{descContent}</CardDescription>
      </CardHeader>
      <CardContent>
        <EarningBarChart data={data} />
      </CardContent>
    </Card>
  );
}
