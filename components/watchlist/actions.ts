"use server";
import { createClient } from "@/utils/supabase/server";
import yahooFinance from "yahoo-finance2";

export type StockData = {
  symbol: string;
  price: number | null;
  change: number | null;
  regularMarketChangePercent: number | null;
  preMarketPrice: number | null;
  preMarketChange: number | null;
  preMarketChangePercent: number | null;
  postMarketPrice: number | null;
  postMarketChange: number | null;
  postMarketChangePercent: number | null;
};

function extractNum(
  v: number | { raw: number } | null | undefined,
): number | null {
  if (typeof v === "number") return v;
  if (v && typeof (v as any).raw === "number") return (v as any).raw;
  return null;
}

export async function getStockData(
  tickers: string[],
): Promise<Record<string, StockData>> {
  const uniq = Array.from(new Set(tickers));
  const fields = [
    "symbol",
    "regularMarketPrice",
    "regularMarketChange",
    "regularMarketChangePercent",
    "preMarketPrice",
    "preMarketChange",
    "preMarketChangePercent",
    "postMarketPrice",
    "postMarketChange",
    "postMarketChangePercent",
  ] as const;

  const data: Record<string, StockData> = {};

  for (const symbol of uniq) {
    try {
      const res = await yahooFinance.quoteCombine(symbol, { fields });
      data[symbol] = {
        symbol: res.symbol,
        price: extractNum(res.regularMarketPrice),
        change: extractNum(res.regularMarketChange),
        regularMarketChangePercent: extractNum(res.regularMarketChangePercent),
        preMarketPrice: extractNum(res.preMarketPrice),
        preMarketChange: extractNum(res.preMarketChange),
        preMarketChangePercent: extractNum(res.preMarketChangePercent),
        postMarketPrice: extractNum(res.postMarketPrice),
        postMarketChange: extractNum(res.postMarketChange),
        postMarketChangePercent: extractNum(res.postMarketChangePercent),
      };
    } catch (err: any) {
      // if it's a validation error, err.result holds the raw array
      if (Array.isArray(err.result) && err.result[0]) {
        const raw = err.result[0] as any;
        data[symbol] = {
          symbol: raw.symbol,
          price: extractNum(raw.regularMarketPrice),
          change: extractNum(raw.regularMarketChange),
          regularMarketChangePercent: extractNum(
            raw.regularMarketChangePercent,
          ),
          preMarketPrice: extractNum(raw.preMarketPrice),
          preMarketChange: extractNum(raw.preMarketChange),
          preMarketChangePercent: extractNum(raw.preMarketChangePercent),
          postMarketPrice: extractNum(raw.postMarketPrice),
          postMarketChange: extractNum(raw.postMarketChange),
          postMarketChangePercent: extractNum(raw.postMarketChangePercent),
        };
      } else {
        console.error(`Yahoo error for ${symbol}:`, err);
        // fallback to nulls so UI doesn’t break
        data[symbol] = {
          symbol,
          price: null,
          change: null,
          regularMarketChangePercent: null,
          preMarketPrice: null,
          preMarketChange: null,
          preMarketChangePercent: null,
          postMarketPrice: null,
          postMarketChange: null,
          postMarketChangePercent: null,
        };
      }
    }
  }

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
