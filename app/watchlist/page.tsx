import { Container } from "@/components/ui/container";
import Watchlist from "@/components/watchlist/Watchlist";
import { createClient } from "@/utils/supabase/server";

export default async function page() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlists")
    .select("*, watchlist_items(*)")
    .order("position", { ascending: true })
    .order("position", { foreignTable: "watchlist_items", ascending: true });

  if (error || !data) {
    console.error("Error fetching watchlist data:", error);
    return null;
  }

  const initialData: Record<string, string[]> = {};

  const sortedColumns: string[] = [];

  for (const wl of data) {
    const items = wl.watchlist_items || [];
    // fallback sort in case the supabase order wasn’t applied:
    items.sort((a, b) => a.position - b.position);
    initialData[wl.name] = items.map((i) => i.ticker);
    sortedColumns.push(wl.name);
  }

  return (
    <Container variant={"fullMobileConstrainedPadded"}>
      <div className="mx-auto max-w-lg">
        <Watchlist initialData={initialData} initialColumns={sortedColumns} />
      </div>
    </Container>
  );
}
