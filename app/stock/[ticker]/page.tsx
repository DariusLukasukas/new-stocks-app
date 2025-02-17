import { getInterval, getPeriod1 } from "@/lib/chartUtils";
import yahooFinance from "yahoo-finance2";
import StockAreaChart from "@/components/charts/StockAreaChart";
import PriceLabel from "@/components/stock/PriceLabel";
import GoBack from "@/components/ui/go-back";
import { Bookmark, Moon, NotebookPen } from "lucide-react";
import Widget from "@/components/stock/Widget";
import KPIs from "@/components/stock/KPIs";
import { Button } from "@/components/ui/button";
import TickerImage from "@/components/stock/TickerImage";

async function getStockChartData(ticker: string, range: string = "1w") {
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
  const result = await yahooFinance.quote(ticker);
  return result;
}

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

  const chartData = await getStockChartData(ticker, range as string);
  const stockData = await getStockData(ticker);

  const [stock, chart] = await Promise.all([stockData, chartData]);
  console.log(stock);
  return (
    <div className="container mx-auto px-2 pb-20">
      <div className="flex flex-row items-center justify-between py-4">
        <div className="flex flex-row items-center space-x-2">
          <GoBack />

          <div className="inline-flex size-10 items-center justify-center rounded-md border bg-black p-1">
            <TickerImage ticker={ticker} />
          </div>

          <div className="leading-none">
            <div className="font-bold">{stock.symbol}</div>
            <div className="text-muted-foreground">{stock.longName}</div>
          </div>
        </div>

        <div className="inline-flex gap-2">
          <Button variant="secondary">
            <NotebookPen />
            Analyze
          </Button>
          <Button size="icon" variant="secondary">
            <Bookmark className="size-5 fill-blue-500 stroke-blue-500" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex flex-row items-center justify-between py-10">
            <div className="flex gap-2">
              <PriceLabel
                label="At close"
                price={stock.regularMarketPrice}
                change={stock.regularMarketChange}
                changePercent={stock.regularMarketChangePercent}
              />
              <PriceLabel
                label="After hours"
                icon={
                  <Moon
                    size={12}
                    className="fill-muted-foreground stroke-muted-foreground"
                  />
                }
                price={stock.postMarketPrice}
                change={stock.postMarketChange}
                changePercent={stock.postMarketChangePercent}
              />
            </div>
            <div className="hidden place-self-end md:block">
              <div className="text-muted-foreground w-fit rounded-md border px-1.5 py-0.5 font-mono text-sm">
                {stock.fullExchangeName}·{stock.currency}
              </div>
            </div>
          </div>

          <StockAreaChart data={chart} />
        </div>

        <div className="hidden w-full max-w-md self-end lg:block">
          <Widget />
        </div>
      </div>

      <div className="py-10">
        <KPIs ticker={ticker} />
      </div>
    </div>
  );
}
