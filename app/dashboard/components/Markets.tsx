import { getStockData } from "@/components/watchlist/actions";
import { getStockChartData } from "../stock/[ticker]/actions";
import MarketsClient from "./MarketsClient";

export const revalidate = 3600; // invalidate every hour

const MARKETS = [
  { title: "Dow Jones", ticker: "^DJI" },
  { title: "S&P 500", ticker: "^GSPC" },
  { title: "Nasdaq", ticker: "^IXIC" },
  { title: "Russell 2000", ticker: "^RUT" },
  { title: "VIX", ticker: "^VIX" },
];

export default async function Markets({ ticker }: { ticker: string }) {
  const tickers = MARKETS.map((m) => m.ticker);
  const allQuotes = await getStockData(tickers);
  const chartData = await getStockChartData(ticker);

  const marketsData = MARKETS.map((m) => ({
    ...m,
    price: allQuotes[m.ticker].price ?? 0,
    regularMarketChangePercent:
      allQuotes[m.ticker].regularMarketChangePercent ?? 0,
  }));

  return (
    <MarketsClient
      marketsData={marketsData}
      chartData={chartData}
      currentTicker={ticker}
    />
  );
}
