import { getStockData, getWatchlists } from "./actions";
import Watchlist from "./Watchlist";
import WatchlistSidebarButton from "./WatchlistSidebarButton";

export default async function WatchlistSidebar() {
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
    <WatchlistSidebarButton>
      <Watchlist
        initialData={initialData}
        initialColumns={sortedColumns}
        stockData={stockData}
      />
    </WatchlistSidebarButton>
  );
}
