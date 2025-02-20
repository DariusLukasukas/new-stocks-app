import yahooFinance from "yahoo-finance2";
import StockEarningQChart from "../charts/StockEarningQChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

async function getEarnings({ ticker }: { ticker: string }) {
  "use cache";
  const data = await yahooFinance.quoteSummary(ticker, {
    modules: ["earnings"],
  });

  return data;
}

export type EarningsData = Awaited<ReturnType<typeof getEarnings>>;

export default async function Earnings({
  ticker = "AAPL",
}: {
  ticker: string;
}) {
  const data = await getEarnings({ ticker });

  if (!data) {
    return <div>No data available</div>;
  }

  console.log(data);

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Earnings per share</CardTitle>
        <CardDescription>EPS forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <StockEarningQChart data={data} />
      </CardContent>
    </Card>
  );
}
