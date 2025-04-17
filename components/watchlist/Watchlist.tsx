"use client";
import { Children, useRef, useState } from "react";
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
import { updateWatchlistOrder } from "@/app/watchlist/actions";

function cloneDeep(object: object) {
  return JSON.parse(JSON.stringify(object));
}

const DEFAULT_COLUMN = "Holdings";

function Item({
  id,
  column,
  index,
  showEditColumn,
  checked,
  onToggleCheck,
}: {
  id: string;
  column: string;
  index: number;
  showEditColumn?: boolean;
  checked?: boolean;
  onToggleCheck?: (column: string, item: string) => void;
}) {
  const { ref } = useSortable({
    id,
    index,
    group: column,
    type: "item",
    accept: ["item"],
    collisionPriority: CollisionPriority.Highest,
  });

  return (
    <div
      ref={ref}
      className="bg-card flex flex-row items-center gap-2 rounded-lg p-2"
    >
      {showEditColumn && (
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggleCheck && onToggleCheck(column, id)}
        />
      )}
      <span className="font-medium">{id}</span>
    </div>
  );
}

function Column({
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
}) {
  const { ref } = useSortable({
    id,
    index,
    type: "column",
    accept: ["column", "item"],
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
          >
            <X />
          </Button>
        )}
      </div>
      {Children.count(children) > 0 ? children : <Button>Add tickers</Button>}
    </div>
  );
}

interface WatchlistProps {
  initialData: Record<string, string[]>; // keyed by watchlist name with list of tickers
  initialColumns: string[]; // list of column names in desired order
}

export default function Watchlist({
  initialData,
  initialColumns,
}: WatchlistProps) {
  const [items, setItems] = useState<Record<string, string[]>>(initialData);
  const [columns, setColumns] = useState(initialColumns);

  const [newColumnName, setNewColumnName] = useState("");

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddTicker, setShowAddTicker] = useState(false);
  const [showEditColumn, setShowEditColumn] = useState(false);

  // We use a key string composed of `${column}#${item}`.
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {},
  );

  const snapshot = useRef(cloneDeep(items));

  function handleRemoveColumn(column: string) {
    if (column === DEFAULT_COLUMN) return;

    const remove = () => {
      setItems((items) => {
        const newItems = { ...items };
        delete newItems[column];
        return newItems;
      });
      setColumns((cols) => cols.filter((col) => col !== column));
    };

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(remove));
    } else {
      remove();
    }
  }

  function handleAddColumn() {
    if (!newColumnName.trim()) return;
    const add = () => {
      const column = newColumnName.trim();
      // Update items state by adding a new column with an empty array
      setItems((prevItems) => ({ ...prevItems, [column]: [] }));
      // Append the new column name to the columns state
      setColumns((prevColumns) => [...prevColumns, column]);
      setNewColumnName("");
    };

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(add));
    } else {
      add();
    }
  }

  function toggleItemSelection(column: string, item: string) {
    const key = `${column}#${item}`;
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function toggleTickerInColumn(column: string, tickerRecord: TickerRecord) {
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
  }

  // Compute the number of checked items across all columns
  const numChecked = Object.values(selectedItems).filter(Boolean).length;

  function handleDeleteCheckedItems() {
    const deleteItems = () => {
      setItems((prevItems) => {
        // Filter out checked items from each column
        const newItems: Record<string, string[]> = { ...prevItems };
        for (const column in newItems) {
          newItems[column] = newItems[column].filter(
            (item) => !selectedItems[`${column}#${item}`],
          );
        }
        return newItems;
      });
      // Clear selections after deletion
      setSelectedItems({});
    };

    if (supportsViewTransition(document)) {
      document.startViewTransition(() => flushSync(deleteItems));
    } else {
      deleteItems();
    }
  }

  return (
    <DragDropProvider
      onDragStart={() => {
        snapshot.current = cloneDeep(items);
      }}
      onDragOver={(event) => {
        const { source } = event.operation;

        if (source?.type === "column") {
          // We can rely on optimistic sorting for columns
          return;
        }

        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
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
              <Button
                variant={"secondary"}
                onClick={handleDeleteCheckedItems}
                className="text-red-500"
              >
                Delete
              </Button>
            </div>
          )}

          {showAddTicker && (
            <Autocomplete
              onSelect={(tickerRecord) =>
                toggleTickerInColumn(DEFAULT_COLUMN, tickerRecord)
              }
              showAddTicker={() => setShowAddTicker(false)}
              existingTickers={items[DEFAULT_COLUMN]}
            />
          )}

          {/* Add new watchlist */}
          {showAddColumn && (
            <div className="flex flex-row gap-2">
              <Input
                placeholder="Add watchlist"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <Button
                variant={"secondary"}
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnName("");
                }}
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
              >
                Create
              </Button>
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
                    ? () => handleRemoveColumn(column)
                    : undefined
                }
              >
                {items[column]?.map((item, index) => {
                  const key = `${column}#${item}`;
                  return (
                    <Item
                      key={item}
                      id={item}
                      column={column}
                      index={index}
                      showEditColumn={showEditColumn}
                      checked={!!selectedItems[key]}
                      onToggleCheck={toggleItemSelection}
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
