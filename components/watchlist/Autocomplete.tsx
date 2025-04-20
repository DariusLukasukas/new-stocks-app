"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import COMPANY_TICKER_EXCHANGE from "@/data/company_tickers_exchange.json";
import { useDebounce } from "@uidotdev/usehooks";
import { Trie } from "../search/Trie";
import { Button } from "../ui/button";
import { Bookmark, Bookmark as BookmarkFilled } from "lucide-react";

export type TickerRecord = {
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

type AutocompleteProps = {
  onSelect: (tickerRecord: TickerRecord) => void;
  showAddTicker: () => void;
  existingTickers: string[];
};

export default function Autocomplete({
  onSelect,
  showAddTicker,
  existingTickers,
}: AutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<TickerRecord[]>([]);

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

  return (
    <Command shouldFilter={false} className="md:max-w-md">
      <div className="flex w-full flex-row gap-2">
        <CommandInput
          value={searchTerm}
          onValueChange={(val) => setSearchTerm(val)}
          showSearchIcon={false}
          placeholder="Search tickers..."
          className="text-lg caret-blue-500"
          wrapperClassName="border-none px-2"
        />
        <Button
          variant={"custom"}
          onClick={() => {
            setSearchTerm("");
            showAddTicker();
          }}
          className="text-blue-500 hover:text-blue-400"
        >
          Done
        </Button>
      </div>
      <CommandList className="max-h-screen">
        {debouncedSearchTerm.length > 0 && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {results.length > 0 && (
          <CommandGroup heading="Suggestions">
            {results.map((item) => {
              const isAlreadyAdded = existingTickers
                .map((ticker) => ticker.toLowerCase())
                .includes(item.ticker.toLowerCase());

              return (
                <CommandItem
                  key={item.cik}
                  onSelect={() => {
                    onSelect(item);
                  }}
                >
                  <span className="w-16 min-w-fit font-semibold">
                    {item.ticker}
                  </span>
                  <span className="flex-1 font-medium">
                    {capitalizeWords(item.name)}
                  </span>
                  {isAlreadyAdded ? (
                    <BookmarkFilled className="size-5 fill-blue-500 text-blue-500" />
                  ) : (
                    <Bookmark className="size-5" />
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
