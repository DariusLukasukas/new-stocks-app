"use server";

import { getInterval, getPeriod1 } from "@/lib/chartUtils";
import yahooFinance from "yahoo-finance2";
import { DEFAULT_INTERVALS } from "./page";

export async function getStockChartData(ticker: string, range: string = "1w") {
  const queryOptions = {
    period1: getPeriod1(range),
    period2: new Date().getTime(),
    interval: getInterval(range) as DEFAULT_INTERVALS,
  };
  const result = await yahooFinance.chart(ticker, queryOptions);
  return result;
}

export async function getStockData(ticker: string) {
  const result = await yahooFinance.quote(ticker);
  return result;
}
