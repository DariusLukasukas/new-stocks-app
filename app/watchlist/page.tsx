import { getStockData, getWatchlists } from "@/components/watchlist/actions";
import Watchlist from "@/components/watchlist/Watchlist";

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
    <div className="mx-auto w-full max-w-lg">
      <Watchlist
        initialData={initialData}
        initialColumns={sortedColumns}
        stockData={stockData}
      />
    </div>
  );
}
