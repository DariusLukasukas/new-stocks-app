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

export async function deleteWatchlistItems(
  itemsToDelete: Record<string, string[]>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // for each list, call the DB function once:
  for (const [name, tickers] of Object.entries(itemsToDelete)) {
    if (tickers.length === 0) continue;

    // lookup the watchlist id
    const { data: wl, error: e1 } = await supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .single();
    if (e1 || !wl) throw new Error(e1?.message || "List not found");

    // single RPC call to do both delete + re‑index
    const { error: rpcError } = await supabase.rpc(
      "delete_and_reindex_watchlist_items",
      {
        p_watchlist_id: wl.id,
        p_tickers: tickers,
      },
    );
    if (rpcError) throw new Error(rpcError.message);
  }

  return true;
}

export async function addWatchlistItems(
  itemsToAdd: Record<string, string[]>,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Not authenticated");

  for (const [name, tickers] of Object.entries(itemsToAdd)) {
    if (tickers.length === 0) continue;
    // look up id
    const { data: wl, error: wlErr } = await supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .single();
    if (wlErr || !wl) throw new Error(wlErr?.message || "List not found");

    // single RPC does insert + (optional) reindex
    const { error: rpcErr } = await supabase.rpc(
      "add_and_reindex_watchlist_items",
      {
        p_watchlist_id: wl.id,
        p_tickers: tickers,
      },
    );
    if (rpcErr) throw new Error(rpcErr.message);
  }

  return true;
}

export async function moveWatchlistItem(params: {
  fromColumnName: string;
  toColumnName: string;
  ticker: string;
  newPosition: number;
}): Promise<boolean> {
  const { fromColumnName, toColumnName, ticker, newPosition } = params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Not authenticated");

  // helper to look up a watchlist ID by name
  async function getId(name: string) {
    const { data: wl, error } = await supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", user!.id)
      .eq("name", name)
      .single();
    if (error || !wl) throw new Error(error?.message || "List not found");
    return wl.id;
  }

  const fromId = await getId(fromColumnName);
  const toId = await getId(toColumnName);

  const { error: rpcErr } = await supabase.rpc("move_watchlist_item", {
    p_source_watchlist_id: fromId,
    p_dest_watchlist_id: toId,
    p_ticker: ticker,
    p_new_position: newPosition,
  });
  if (rpcErr) throw new Error(rpcErr.message);
  return true;
}
