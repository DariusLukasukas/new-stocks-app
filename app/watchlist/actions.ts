"use server";

import { createClient } from "@/utils/supabase/server";

export async function addWatchlistColumn({
  name,
  position,
}: {
  name: string;
  position: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("watchlists")
    .insert({
      user_id: user.id,
      name: name,
      is_default: false,
      position: position,
    })
    .select("*");

  if (error) {
    console.error("Error adding watchlist:", name, error);
    throw new Error(error.message);
  }
}

export async function deleteWatchlistColumn(name: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("name", name)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting watchlist:", name, error);
    throw new Error(error.message);
  }
}

interface ColumnOrder {
  name: string;
  position: number;
}

export async function updateWatchlistOrder(columns: ColumnOrder[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  for (const { name, position } of columns) {
    const { error } = await supabase
      .from("watchlists")
      .update({ position })
      .eq("name", name)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating position for:", name, error);
      throw new Error(error.message);
    }
  }

  return true;
}

export async function batchAddTickersToWatchlist({
  watchlistName,
  tickers,
}: BatchAddTickersInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Retrieve the watchlist ID for the given watchlist name (assumed unique per user).
  const { data: watchlistData, error: watchlistError } = await supabase
    .from("watchlists")
    .select("id")
    .eq("name", watchlistName)
    .eq("user_id", user.id)
    .single();

  if (watchlistError || !watchlistData) {
    throw new Error(
      watchlistError ? watchlistError.message : "Watchlist not found",
    );
  }
  const watchlistId = watchlistData.id;

  // Optionally, compute the current number of items (for ordering).
  const { data: currentItems, error: itemsError } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("watchlist_id", watchlistId);

  if (itemsError) {
    throw new Error(itemsError.message);
  }
  const basePosition = currentItems ? currentItems.length : 0;

  // Prepare all the ticker rows to be inserted.
  const tickerRows = tickers.map((ticker, index) => ({
    watchlist_id: watchlistId,
    ticker,
    position: basePosition + index,
  }));

  const { error } = await supabase.from("watchlist_items").insert(tickerRows);
  if (error) {
    console.error("Error adding tickers to watchlist:", error);
    throw new Error(error.message);
  }

  return true;
}

interface batchAddTickersToWatchlistInput {
  watchlistName: string;
  tickers: string[];
}

export async function batchDeleteTickersFromWatchlist({
  watchlistName,
  tickers,
}: batchAddTickersToWatchlistInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: watchlistData, error: watchlistError } = await supabase
    .from("watchlists")
    .select("id")
    .eq("name", watchlistName)
    .eq("user_id", user.id)
    .single();

  if (watchlistError || !watchlistData) {
    throw new Error(
      watchlistError ? watchlistError.message : "Watchlist not found",
    );
  }

  const watchlistId = watchlistData.id;
  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .in("ticker", tickers)
    .eq("watchlist_id", watchlistId);

  if (error) {
    console.error("Error deleting tickers from watchlist:", error);
    throw new Error(error.message);
  }

  return true;
}
