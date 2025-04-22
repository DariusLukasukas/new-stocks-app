import { getStockChartData, getStockData } from "@/app/stock/[ticker]/actions";

export type StockData = Awaited<ReturnType<typeof getStockData>>;
export type StockChartData = Awaited<ReturnType<typeof getStockChartData>>;
export type RecommendationTrend = NonNullable<StockData["recommendationTrend"]>;
export type FinancialData = NonNullable<StockData["financialData"]>;
export type PriceData = NonNullable<StockData["price"]>;
export type EarningsModule = NonNullable<StockData["earnings"]>;
export type QuarterlyDataPoint =
  EarningsModule["financialsChart"]["quarterly"][number];
export type QuarterlyEarningsPoint =
  EarningsModule["earningsChart"]["quarterly"][number];
export type EarningsChart = EarningsModule["earningsChart"];
