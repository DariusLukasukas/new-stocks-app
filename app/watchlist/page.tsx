import { Container } from "@/components/ui/container";
import Watchlist from "@/components/watchlist/Watchlist";
import { createClient } from "@/utils/supabase/server";

export default async function page() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlists")
    .select("*, watchlist_items(*)")
    .order("position", { ascending: true });

  if (error || !data) {
    console.error("Error fetching watchlist data:", error);
    return null;
  }

  const initialData: Record<string, string[]> = {};

  const sortedColumns: string[] = [];

  for (const watchlist of data) {
    sortedColumns.push(watchlist.name);
    initialData[watchlist.name] = (watchlist.watchlist_items || []).map(
      (item) => item.ticker,
    );
  }

  return (
    <Container variant={"fullMobileConstrainedPadded"}>
      <div className="mx-auto max-w-lg">
        <Watchlist initialData={initialData} initialColumns={sortedColumns} />
      </div>
    </Container>
  );
}
