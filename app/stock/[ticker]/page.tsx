import StockAreaChart from "@/components/charts/StockAreaChart";
import PriceLabel from "@/components/stock/PriceLabel";
import GoBack from "@/components/ui/go-back";
import { Bookmark, Moon } from "lucide-react";
import KPIs from "@/components/stock/KPIs";
import { Button } from "@/components/ui/button";
import TickerImage from "@/components/stock/TickerImage";
import AnalystEstimates from "@/components/stock/AnalystEstimates";
import PriceTarget from "@/components/stock/PriceTarget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Earnings from "@/components/stock/Earnings";
import RevenueEarnings from "@/components/stock/RevenueEarnings";
import { getStockChartData, getStockData } from "./actions";

export const revalidate = 60; // revalidate every 60 seconds

export type ChartData = Awaited<ReturnType<typeof getStockChartData>>;
export type DEFAULT_INTERVALS = "1m" | "15m" | "30m" | "60m" | "1d";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { ticker } = await params;
  const { range = "1w" } = await searchParams;

  const chartData = await getStockChartData(ticker, String(range));
  const stockData = await getStockData(ticker);
  const [stock, chart] = await Promise.all([stockData, chartData]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <GoBack />
          <div className="inline-flex size-10 items-center justify-center rounded-md bg-black p-1 dark:border">
            <TickerImage ticker={ticker} />
          </div>
          <div className="flex h-10 flex-col justify-center gap-0.5 leading-none">
            <p className="font-bold">{stock.price!.symbol}</p>
            <p className="text-muted-foreground font-medium">
              {stock.price!.longName}
            </p>
          </div>
        </div>

        <div className="inline-flex gap-2">
          <Button variant="secondary">AI Insights</Button>
          <Button variant="secondary">
            <Bookmark className="fill-blue-500 stroke-blue-500" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-row gap-8 py-8">
          <PriceLabel
            label="At close"
            price={stock.price!.regularMarketPrice}
            change={stock.price!.regularMarketChange}
            changePercent={stock.price!.regularMarketChangePercent}
          />
          <PriceLabel
            label="After hours"
            icon={
              <Moon
                size={12}
                className="fill-muted-foreground stroke-muted-foreground"
              />
            }
            price={stock.price!.postMarketPrice}
            change={stock.price!.postMarketChange}
            changePercent={stock.price!.postMarketChangePercent}
          />
        </div>

        <StockAreaChart data={chart} />
      </div>

      <div className="py-10">
        <Card className="border-none bg-neutral-100/50 dark:bg-zinc-900/70">
          <CardContent className="divide-y-1 pt-6 lg:grid lg:grid-cols-8 lg:divide-none">
            <KPIs data={stock} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-24 border-none bg-neutral-100/50 md:px-8 dark:bg-zinc-900/70">
        <CardHeader>
          <CardTitle className="text-lg">Analyst estimates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <AnalystEstimates data={stock} className="border-none" />
          <PriceTarget data={stock} ticker={ticker} className="border-none" />
        </CardContent>

        <CardHeader>
          <CardTitle className="text-lg">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <RevenueEarnings data={stock} className="border-none" />
          <Earnings data={stock} className="border-none" />
        </CardContent>
      </Card>
    </div>
  );
}
