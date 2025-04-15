import { Container } from "@/components/ui/container";
import Watchlist from "@/components/watchlist/Watchlist";
import { createClient } from "@/utils/supabase/server";

export default async function page() {
  const supabase = await createClient();

  const { data: watchlists, error } = await supabase
    .from("watchlists")
    .select("*")
    .order("position", { ascending: true });

  if (error || !watchlists) {
    console.error("Error fetching watchlist data:", error);
    return null;
  }

  // Create a mapping from watchlist id to watchlist name
  const idToName: Record<number, string> = {};
  // This structure will hold our organized data, e.g. { "Holdings": ["AAPL", "MSFT"], "Column 1": ["TSLA", "META"] }
  const initialData: Record<string, string[]> = {};

  // Initialize the initialData object based on watchlists rows
  for (const watchlist of watchlists) {
    idToName[watchlist.id] = watchlist.name;
    // Use the name as the key. The ordering of keys here doesn’t matter; we will preserve ordering by having a separate list if needed.
    initialData[watchlist.name] = [];
  }

  const sortedColumns = watchlists.map((w) => w.name);

  return (
    <Container variant={"fullMobileConstrainedPadded"}>
      <div className="mx-auto max-w-lg">
        <Watchlist initialData={initialData} initialColumns={sortedColumns} />
      </div>
    </Container>
  );
}
