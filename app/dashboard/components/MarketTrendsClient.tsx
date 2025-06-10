"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type TrendItem = {
  symbol: string;
  price: number;
  name: string;
  change: number;
  changesPercentage: number;
  exchange: string;
};

interface Props {
  data: TrendItem[];
}

export function MarketTrendsClient({ data }: Props) {
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const [page, setPage] = useState(1);
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = data.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="h-full flex-1 overflow-auto">
        <table className="h-full w-full table-fixed border-collapse text-left">
          <tbody>
            {currentItems.map((row) => {
              const positive = row.change >= 0;
              return (
                <tr
                  key={row.symbol}
                  className="hover:bg-background-primary/10 transition-colors"
                >
                  <td className="py-2 font-semibold whitespace-nowrap">
                    {row.symbol}
                  </td>
                  <td
                    title={row.name}
                    className="text-text-secondary max-w-[140px] truncate py-2"
                  >
                    {row.name}
                  </td>
                  <td
                    className={cn(
                      "font-nunito py-2 text-right text-sm font-bold",
                      positive ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {usd.format(row.change)}
                  </td>
                  <td
                    className={cn(
                      "font-nunito py-2 text-right text-sm font-bold",
                      positive ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {positive ? "+" : ""}
                    {row.changesPercentage.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex flex-row items-center justify-end gap-1 py-2">
        <Button
          size={"icon"}
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="bg-background-primary size-7 shadow-none"
        >
          <ArrowLeft strokeWidth={2.5} />
        </Button>
        <Button
          size={"icon"}
          variant="secondary"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="bg-background-primary size-7 shadow-none"
        >
          <ArrowRight strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
