"use client";
import { Children, memo, useCallback, useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { RestrictToWindow } from "@dnd-kit/dom/modifiers";
import { supportsViewTransition } from "@dnd-kit/dom/utilities";

import { move } from "@dnd-kit/helpers";
import { Button } from "../ui/button";
import { CopyPlus, ListX, Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { flushSync } from "react-dom";
import Autocomplete, { TickerRecord } from "./Autocomplete";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  addWatchlistColumn,
  addWatchlistItems,
  deleteWatchlistColumn,
  deleteWatchlistItems,
  moveWatchlistItem,
  updateWatchlistOrder,
} from "@/app/watchlist/actions";
import TickerImage from "../stock/TickerImage";

function cloneDeep(object: object) {
  return JSON.parse(JSON.stringify(object));
}

const DEFAULT_COLUMN = "Holdings";

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
  minimumFractionDigits: 2,
});

const percentFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "always",
  minimumFractionDigits: 2,
});

const Item = memo(function Item({
  id,
  column,
  index,
  showEditColumn,
  checked,
  onToggleCheck,
  stock: { price, change, changePercent },
}: {
  id: string;
  column: string;
  index: number;
  showEditColumn?: boolean;
  checked?: boolean;
  onToggleCheck?: (column: string, item: string) => void;
  stock: {
    price: number | null;
    change: number | null;
    changePercent: number | null;
  };
}) {
  const { ref } = useSortable({
    id,
    index,
    group: column,
    data: { column, item: id },
    type: "item",
    accept: ["item"],
    collisionPriority: CollisionPriority.Highest,
  });

  return (
    <div
      ref={ref}
      className="bg-card flex flex-row items-center justify-between rounded-lg p-2"
    >
      <div className="flex min-w-28 flex-row items-center gap-2">
        {showEditColumn && (
          <Checkbox
            aria-label="Select ticker to delete"
            checked={checked}
            onCheckedChange={() => onToggleCheck && onToggleCheck(column, id)}
          />
        )}
        <div className="inline-flex size-5 items-center justify-center rounded bg-black p-1">
          <TickerImage ticker={id} />
        </div>
        <p className="font-semibold">{id}</p>
      </div>
      <p className="min-w-16 text-right font-medium">
        {price != null ? `$${price.toFixed(2)}` : "–"}
      </p>
      <div className="flex flex-row items-center gap-2">
        <p
          className={cn(
            "min-w-16 text-center",
            change != null && change >= 0 ? "text-green-600" : "text-red-600",
          )}
        >
          {change != null ? currencyFmt.format(change) : "–"}
        </p>
        <p
          className={cn(
            "min-w-20 rounded-lg px-2 py-0.5 text-center",
            changePercent != null && changePercent >= 0
              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
          )}
        >
          {changePercent != null ? percentFmt.format(changePercent / 100) : "–"}
        </p>
      </div>
    </div>
  );
});
Item.displayName = "Item";

const Column = memo(
  ({
    children,
    id,
    index,
    title,
    onRemove,
  }: {
    children?: React.ReactNode;
    id: string;
    index: number;
    title?: string;
    onRemove?: () => void;
  }) => {
    const { ref } = useSortable({
      id,
      index,
      type: "column",
      accept: ["column", "item"],
      data: { column: id },
      collisionPriority: CollisionPriority.High,
      modifiers: [RestrictToVerticalAxis, RestrictToWindow],
    });
    return (
      <div
        ref={ref}
        className="bg-secondary flex h-auto min-w-3xs flex-col gap-2 rounded-lg p-2"
      >
        <div className="group/card flex min-h-9 flex-row items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          {onRemove && (
            <Button
              size={"icon"}
              variant={"custom"}
              onClick={onRemove}
              className="hidden group-hover/card:inline-flex"
              aria-label="Delete watchlist column"
            >
              <X />
            </Button>
          )}
        </div>
        {Children.count(children) > 0 ? children : <Button>Add tickers</Button>}
      </div>
    );
  },
);
Column.displayName = "Column";

interface StockData {
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

interface WatchlistProps {
  initialData: Record<string, string[]>; // keyed by watchlist name with list of tickers
  initialColumns: string[]; // list of column names in desired order
  stockData: Record<string, StockData>;
}

export default function Watchlist({
  initialData,
  initialColumns,
  stockData,
}: WatchlistProps) {
  const [items, setItems] = useState<Record<string, string[]>>(initialData);
  const [columns, setColumns] = useState(initialColumns);
  const snapshot = useRef(cloneDeep(items));

  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumnError, setShowAddColumnError] = useState(false);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddTicker, setShowAddTicker] = useState(false);
  const [showEditColumn, setShowEditColumn] = useState(false);

  // We use a key string composed of `${column}#${item}`.
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {},
  );

  const fromColumnRef = useRef<string | null>(null);

  const handleAddColumn = useCallback(() => {
    if (!newColumnName.trim()) return;
    const add = () => {
      const column = newColumnName.trim();
      // Update items state by adding a new column with an empty array
      setItems((prevItems) => ({ ...prevItems, [column]: [] }));
      // Append the new column name to the columns state
      setColumns((prevColumns) => [...prevColumns, column]);
      setNewColumnName("");
    };

    addWatchlistColumn({
      name: newColumnName,
      position: columns.length,
    }).catch((error) => {
      console.error("Error adding watchlist column:", error);
    });

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(add));
    } else {
      add();
    }
  }, [columns.length, newColumnName]);

  const handleDeleteColumn = useCallback((column: string) => {
    if (column === DEFAULT_COLUMN) return;

    const remove = () => {
      setItems((items) => {
        const newItems = { ...items };
        delete newItems[column];
        return newItems;
      });
      setColumns((cols) => cols.filter((col) => col !== column));
    };

    deleteWatchlistColumn(column).catch((error) => {
      console.error("Error deleting watchlist column:", error);
    });

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(remove));
    } else {
      remove();
    }
  }, []);

  const toggleItemSelection = useCallback((column: string, item: string) => {
    const key = `${column}#${item}`;
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleAddItemToColumn = useCallback(
    (column: string, tickerRecord: TickerRecord) => {
      const add = () => {
        setItems((prevItems) => {
          // Normalize ticker strings for a case-insensitive check.
          const currentTickers = prevItems[column];
          const alreadyExists = currentTickers
            .map((t) => t.toLowerCase())
            .includes(tickerRecord.ticker.toLowerCase());

          if (alreadyExists) {
            // Remove the ticker if it exists.
            return {
              ...prevItems,
              [column]: currentTickers.filter(
                (t) => t.toLowerCase() !== tickerRecord.ticker.toLowerCase(),
              ),
            };
          } else {
            // Add the ticker if it does not exist.
            return {
              ...prevItems,
              [column]: [...currentTickers, tickerRecord.ticker],
            };
          }
        });
      };

      if (supportsViewTransition(document)) {
        document.startViewTransition(() => flushSync(add));
      } else {
        add();
      }
    },
    [],
  );

  const handleAddTickerDone = useCallback(async () => {
    const before = initialData[DEFAULT_COLUMN] ?? [];
    const after = items[DEFAULT_COLUMN] ?? [];
    const newOnes = after.filter((t) => !before.includes(t));

    if (newOnes.length > 0) {
      try {
        await addWatchlistItems({ [DEFAULT_COLUMN]: newOnes });
      } catch (e) {
        console.error("Failed to persist new tickers:", e);
        // optional: roll back or refetch here
      }
    }

    setShowAddTicker(false);
  }, [items, initialData]);

  // Compute the number of checked items across all columns
  const numChecked = Object.values(selectedItems).filter(Boolean).length;

  const handleDeleteItemsFromColumn = useCallback(() => {
    // group selected keys into { column: [tickers] }
    const itemsToDelete: Record<string, string[]> = {};
    for (const key of Object.keys(selectedItems)) {
      if (!selectedItems[key]) continue;
      const [column, ticker] = key.split("#");
      itemsToDelete[column] = itemsToDelete[column] || [];
      itemsToDelete[column].push(ticker);
    }
    const applyLocal = () => {
      setItems((prev) => {
        const next = { ...prev };
        for (const col in itemsToDelete) {
          next[col] = next[col].filter((t) => !itemsToDelete[col].includes(t));
        }
        return next;
      });
      setSelectedItems({});
    };
    try {
      if (supportsViewTransition(document)) {
        document.startViewTransition(() => flushSync(applyLocal));
      } else {
        applyLocal();
      }
      // call server action
      deleteWatchlistItems(itemsToDelete);
    } catch (e) {
      console.error("Failed to delete watchlist items", e);
      // optionally refetch or roll back
    }
  }, [selectedItems]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNewColumnName(value);

      setShowAddColumnError(
        value.trim() !== "" &&
          Object.keys(items).some(
            (key) => key.toLowerCase() === value.trim().toLowerCase(),
          ),
      );
    },
    [items],
  );

  return (
    <DragDropProvider
      onDragStart={(event) => {
        snapshot.current = cloneDeep(items);
        fromColumnRef.current = event.operation.source?.data.column;
      }}
      onDragOver={(event) => {
        const { source } = event.operation;

        if (source?.type === "column") {
          // We can rely on optimistic sorting for columns
          return;
        }
        setItems((items) => move(items, event));
      }}
      onDragEnd={async (event) => {
        if (event.canceled) {
          setItems(snapshot.current);
          return;
        }
        const { source } = event.operation;
        if (source?.type === "column") {
          const newColumns = move(columns, event);
          setColumns(newColumns);

          updateWatchlistOrder(
            newColumns.map((name, idx) => ({ name, position: idx })),
          );
        }
        if (source?.type === "item") {
          const fromColumn = fromColumnRef.current;
          if (!fromColumn) return;
          // @ts-expect-error: 'index' property type mismatch due to dnd experimental lib
          const toColumn = source.sortable.group;
          const ticker = String(source.id);
          // @ts-expect-error: 'index' property type mismatch due to dnd experimental lib
          const newItemIndex = source.sortable.index;
          const next = move(items, event);
          setItems(next);
          try {
            await moveWatchlistItem({
              fromColumnName: fromColumn,
              toColumnName: toColumn,
              ticker: ticker,
              newPosition: newItemIndex,
            });
          } catch (err) {
            console.error("Failed to persist move:", err);
          } finally {
            fromColumnRef.current = null;
          }
        }
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Watchlist header */}
        {!showAddTicker && (
          <div className="flex flex-row items-center justify-between px-2">
            <h1 className="text-2xl font-bold">Watchlist</h1>
            <div className="flex flex-row gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        setShowAddColumn(false);
                        setShowEditColumn(false);
                        setShowAddTicker((prev) => !prev);
                      }}
                      aria-label="Add stocks"
                    >
                      <Plus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add stocks</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        setShowAddColumnError(false);
                        setShowEditColumn(false);
                        setShowAddTicker(false);
                        setShowAddColumn((prev) => !prev);
                      }}
                      aria-label="Add watchlist"
                    >
                      <CopyPlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add watchlist</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        setShowAddTicker(false);
                        setSelectedItems({});
                        setShowEditColumn((prev) => !prev);
                        setShowAddColumn(false);
                        setNewColumnName("");
                      }}
                      aria-label="Edit watchlist"
                      className={cn(
                        showEditColumn &&
                          "border-none bg-blue-500/20 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500",
                      )}
                    >
                      <ListX />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit watchlist</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        <div className="min-h-9">
          {showEditColumn && numChecked > 0 && (
            <div className="flex flex-row items-center justify-between px-2">
              <span className="font-medium">{numChecked} selected</span>
              <div>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    setShowEditColumn(false);
                    setSelectedItems({});
                  }}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>{" "}
                <Button
                  variant={"secondary"}
                  onClick={handleDeleteItemsFromColumn}
                  className="text-red-500"
                  aria-label="Delete selected items"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          {showAddTicker && (
            <Autocomplete
              onSelect={(tickerRecord) =>
                handleAddItemToColumn(DEFAULT_COLUMN, tickerRecord)
              }
              showAddTicker={handleAddTickerDone}
              existingTickers={items[DEFAULT_COLUMN]}
            />
          )}

          {/* Add new watchlist */}
          {showAddColumn && (
            <div>
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Add watchlist"
                  value={newColumnName}
                  onChange={handleInputChange}
                />
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName("");
                  }}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    handleAddColumn();
                    setShowAddColumn(false);
                  }}
                  className="text-blue-500 hover:text-blue-500"
                  disabled={newColumnName.trim() === "" || showAddColumnError}
                  aria-label="Create watchlist"
                >
                  Create
                </Button>
              </div>
              {showAddColumnError && (
                <p className="p-2 text-sm text-red-500">
                  A watchlist with this name already exists.
                </p>
              )}
            </div>
          )}
        </div>

        {!showAddTicker && (
          <div className="flex flex-col gap-4">
            {columns.map((column, index) => (
              <Column
                key={column}
                id={column}
                index={index}
                title={column}
                onRemove={
                  column !== DEFAULT_COLUMN
                    ? () => handleDeleteColumn(column)
                    : undefined
                }
              >
                {items[column]?.map((ticker, index) => {
                  const stock = stockData[ticker] ?? {
                    price: null,
                    change: null,
                    changePercent: null,
                  };
                  return (
                    <Item
                      key={ticker}
                      id={ticker}
                      column={column}
                      index={index}
                      showEditColumn={showEditColumn}
                      checked={!!selectedItems[`${column}#${ticker}`]}
                      onToggleCheck={toggleItemSelection}
                      stock={stock}
                    />
                  );
                })}
              </Column>
            ))}
          </div>
        )}
      </div>
    </DragDropProvider>
  );
}
