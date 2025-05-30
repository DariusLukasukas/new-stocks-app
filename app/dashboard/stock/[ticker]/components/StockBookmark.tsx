import { createClient } from "@/utils/supabase/server";

export default async function StockBookmark() {
  const supabase = createClient();

  return <div>StockBookmark</div>;
}
