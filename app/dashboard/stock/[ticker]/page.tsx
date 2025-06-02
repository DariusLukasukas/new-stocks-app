import StockAreaChart from "@/components/charts/StockAreaChart";
import PriceLabel from "@/components/stock/PriceLabel";
import GoBack from "@/components/ui/go-back";
import { Moon, Sunrise } from "lucide-react";
import KPIs from "@/components/stock/KPIs";
import TickerImage from "@/components/stock/TickerImage";
import AnalystEstimates from "@/components/stock/AnalystEstimates";
import PriceTarget from "@/components/stock/PriceTarget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Earnings from "@/components/stock/Earnings";
import RevenueEarnings from "@/components/stock/RevenueEarnings";
import { getStockChartData, getStockData } from "./actions";
import WatchlistSidebar from "@/components/watchlist/WatchlistSidebar";

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

  console.log(stock);

  const {
    marketState,
    preMarketPrice,
    preMarketChange,
    preMarketChangePercent,
    regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent,
    postMarketPrice,
    postMarketChange,
    postMarketChangePercent,
  } = stock.price!;

  let label: string;
  let price: number;
  let change: number;
  let changePercent: number;
  let icon: React.ReactNode | undefined;

  switch (marketState) {
    case "PRE":
      label = "Pre-Market";
      price = preMarketPrice;
      change = preMarketChange;
      changePercent = preMarketChangePercent;
      icon = (
        <Sunrise
          size={12}
          className="fill-muted-foreground stroke-muted-foreground"
        />
      );
      break;

    case "POST":
      label = "After Hours";
      price = postMarketPrice;
      change = postMarketChange;
      changePercent = postMarketChangePercent;
      icon = (
        <Moon
          size={12}
          className="fill-muted-foreground stroke-muted-foreground"
        />
      );
      break;

    case "REGULAR":
    default:
      label = "Market Price";
      price = regularMarketPrice;
      change = regularMarketChange;
      changePercent = regularMarketChangePercent;
  }

  return (
    <>
      <WatchlistSidebar />
      <div className="flex flex-col gap-8 pb-20">
        <div className="flex flex-row items-center justify-between py-2">
          <div className="flex flex-row items-center gap-2">
            <GoBack />
            <div className="border-border-divider relative inline-flex size-12 items-center justify-center overflow-hidden rounded-xl border-2 p-2 select-none">
              <TickerImage ticker={ticker} />
            </div>
            <div className="flex h-10 flex-col justify-center truncate text-base leading-tight font-semibold tracking-[.009em]">
              <p>{stock.price!.symbol}</p>
              <p className="text-text-secondary">{stock.price!.longName}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-row items-end gap-8 py-8">
            <PriceLabel
              label={label}
              icon={icon}
              price={price}
              change={change}
              changePercent={changePercent}
            />
          </div>

          <StockAreaChart data={chart} />
        </div>

        <Card className="bg-background-secondary my-10 rounded-3xl border-none p-6 shadow-none">
          <CardContent className="grid grid-cols-2 gap-4 divide-y-1 p-0 lg:grid-cols-8 lg:divide-none">
            <KPIs data={stock} />
          </CardContent>
        </Card>

        <Card className="bg-background-primary rounded-3xl border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Analyst estimates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 p-0 lg:grid-cols-2">
            <AnalystEstimates
              data={stock}
              className="bg-background-secondary rounded-3xl border-none shadow-none"
            />
            <PriceTarget
              data={stock}
              ticker={ticker}
              className="bg-background-secondary rounded-3xl border-none shadow-none"
            />
          </CardContent>

          <CardHeader>
            <CardTitle className="text-2xl">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 p-0 lg:grid-cols-2">
            <RevenueEarnings
              data={stock}
              className="bg-background-secondary rounded-3xl border-none shadow-none"
            />
            <Earnings
              data={stock}
              className="bg-background-secondary rounded-3xl border-none shadow-none"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
