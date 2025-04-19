import { Container } from "@/components/ui/container";
import Watchlist from "@/components/watchlist/Watchlist";
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

async function getStockData(
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

async function getWatchlists() {
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

export default async function page() {
  const watchlists = await getWatchlists();

  const initialData: Record<string, string[]> = {};
  const sortedColumns: string[] = [];
  const allTickers: string[] = [];

  for (const wl of watchlists) {
    const items = wl.watchlist_items || [];
    // fallback sort in case the supabase order wasn’t applied:
    items.sort((a, b) => a.position - b.position);

    initialData[wl.name] = items.map((i) => i.ticker);
    sortedColumns.push(wl.name);
    allTickers.push(...items.map((i) => i.ticker));
  }

  const stockData = await getStockData(allTickers);

  return (
    <Container variant={"fullMobileConstrainedPadded"}>
      <div className="mx-auto max-w-lg">
        <Watchlist
          initialData={initialData}
          initialColumns={sortedColumns}
          stockData={stockData}
        />
      </div>
    </Container>
  );
}
