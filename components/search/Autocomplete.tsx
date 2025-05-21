"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import COMPANY_TICKER_EXCHANGE from "@/data/company_tickers_exchange.json";
import { useDebounce } from "@uidotdev/usehooks";
import { Trie } from "./Trie";

type TickerRecord = {
  cik: number;
  name: string;
  ticker: string;
  exchange: string;
};
type TickerRow = [number, string, string, string];

const capitalizeWords = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const DEFAULT_SUGGESTIONS = {
  name: [
    { cik: 320193, name: "Apple Inc.", ticker: "AAPL", exchange: "NASDAQ" },
    {
      cik: 789019,
      name: "Microsoft Corporation",
      ticker: "MSFT",
      exchange: "NASDAQ",
    },
    {
      cik: 1018724,
      name: "Amazon.com Inc.",
      ticker: "AMZN",
      exchange: "NASDAQ",
    },
    {
      cik: 1326801,
      name: "Meta Platforms Inc.",
      ticker: "META",
      exchange: "NASDAQ",
    },
    {
      cik: 1652044,
      name: "Alphabet Inc.",
      ticker: "GOOGL",
      exchange: "NASDAQ",
    },
    { cik: 1318605, name: "Tesla Inc.", ticker: "TSLA", exchange: "NASDAQ" },
  ],
};

export function Autocomplete() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<TickerRecord[]>([]);
  // const renderCount = useRenderCount();

  const router = useRouter();

  // We only want to build these Tries one time. Use a ref to store them.
  const nameTrieRef = useRef<Trie<TickerRecord> | null>(null);
  const tickerTrieRef = useRef<Trie<TickerRecord> | null>(null);

  // Build tries on mount
  useEffect(() => {
    if (!nameTrieRef.current && !tickerTrieRef.current) {
      const nameTrie = new Trie<TickerRecord>();
      const tickerTrie = new Trie<TickerRecord>();

      const { fields, data } = COMPANY_TICKER_EXCHANGE;

      const cikIndex = fields.indexOf("cik");
      const nameIndex = fields.indexOf("name");
      const tickerIndex = fields.indexOf("ticker");
      const exchangeIndex = fields.indexOf("exchange");

      data.forEach((row) => {
        const typedRow = row as TickerRow;
        const record: TickerRecord = {
          cik: Number(typedRow[cikIndex]),
          name: String(typedRow[nameIndex]),
          ticker: String(typedRow[tickerIndex]),
          exchange: String(typedRow[exchangeIndex]),
        };

        nameTrie.insert(record.name.toLowerCase(), record);
        tickerTrie.insert(record.ticker.toLowerCase(), record);
      });

      nameTrieRef.current = nameTrie;
      tickerTrieRef.current = tickerTrie;
    }
  }, []);

  // Debounce the user input so we don't search on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const trieName = nameTrieRef.current;
    const trieTicker = tickerTrieRef.current;

    if (!trieName || !trieTicker) {
      setResults([]);
      return;
    }

    // If no search term, display default suggestions.
    if (!debouncedSearchTerm.trim()) {
      setResults(DEFAULT_SUGGESTIONS.name);
      return;
    }

    // Otherwise, perform the search on both tries.
    const nameMatches = trieName.getSuggestions(debouncedSearchTerm, 50);
    const tickerMatches = trieTicker.getSuggestions(debouncedSearchTerm, 50);

    // Combine results from both tries and remove duplicates (by cik)
    const combined = [...nameMatches, ...tickerMatches];
    const uniqueMap = new Map<number, TickerRecord>();
    combined.forEach((item: TickerRecord) => {
      uniqueMap.set(item.cik, item);
    });
    const finalResults = Array.from(uniqueMap.values());

    setResults(finalResults);
  }, [debouncedSearchTerm]);

  // Toggle the dialog with Ctrl+K / Cmd+K (unless input is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement;
        if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command
        shouldFilter={false}
        className="rounded-none shadow-md md:min-w-[450px]"
      >
        <CommandInput
          value={searchTerm}
          onValueChange={(val) => setSearchTerm(val)}
          placeholder="Search for a company or ticker..."
          className="text-lg caret-blue-500"
        />
        <CommandList className="[&::-webkit-scrollbar-track]:bg-glass-background-secondary [&::-webkit-scrollbar-thumb]:bg-glass-background-primary hover:[&::-webkit-scrollbar-thumb]:bg-glass-background-secondary-hover dark:[&::-webkit-scrollbar-thumb]:bg-background-modal dark:hover:[&::-webkit-scrollbar-thumb]:bg-glass-background-secondary-hover overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full md:text-glass-text-secondary">
          {debouncedSearchTerm.length > 0 && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {results.length > 0 && (
            <CommandGroup heading="Suggestions">
              {results.map((item) => (
                <CommandItem
                  key={item.cik}
                  onSelect={() => {
                    router.push(`/stock/${item.ticker}`);
                    setSearchTerm("");
                    setOpen(false);
                  }}
                >
                  <p className="w-16 min-w-fit font-bold">{item.ticker}</p>
                  <p className="flex-1 font-medium">
                    {capitalizeWords(item.name)}
                  </p>
                  <p className="text-muted-foreground md:text-glass-text-secondary ml-auto text-sm font-medium">
                    {item.exchange.toUpperCase()}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
