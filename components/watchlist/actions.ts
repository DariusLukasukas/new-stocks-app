"use server";
import { createClient } from "@/utils/supabase/server";
import yahooFinance from "yahoo-finance2";

yahooFinance.suppressNotices(["yahooSurvey"]);

yahooFinance.setGlobalConfig({
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
});

type StockData = {
  price: number | null;
  change: number | null;
  changePercent: number | null;
};

export async function getStockData(
  tickers: string[],
): Promise<Record<string, StockData>> {
  const uniq = Array.from(new Set(tickers));
  const fields: (
    | "symbol"
    | "regularMarketPrice"
    | "regularMarketChange"
    | "regularMarketChangePercent"
  )[] = [
    "symbol",
    "regularMarketPrice",
    "regularMarketChange",
    "regularMarketChangePercent",
  ];

  const results = await Promise.all(
    uniq.map((symbol) => yahooFinance.quoteCombine(symbol, { fields })),
  );

  const data: Record<string, StockData> = {};
  results.forEach((res, i) => {
    data[uniq[i]] = {
      price: res.regularMarketPrice ?? null,
      change: res.regularMarketChange ?? null,
      changePercent: res.regularMarketChangePercent ?? null,
    };
  });

  return data;
}

export async function getWatchlists() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watchlists")
    .select("*, watchlist_items(*)")
    .order("position", { ascending: true });

  if (error || !data) {
    console.error("Error fetching watchlist data:", error);
    return [];
  }
  return data;
}
