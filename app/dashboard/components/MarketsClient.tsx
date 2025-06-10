"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import MarketChart from "./MarketChart";
import { cn } from "@/lib/utils";

interface Market {
  title: string;
  ticker: string;
  price: number;
  regularMarketChangePercent: number;
}

interface Props {
  marketsData: Market[];
  chartData: any;
  currentTicker: string;
}

export default function MarketsClient({
  marketsData,
  chartData,
  currentTicker,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onRowClick = (ticker: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ticker", ticker);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const current = marketsData.find((m) => m.ticker === currentTicker)!;
  const isPositive = current.regularMarketChangePercent >= 0;

  // Tailwind arbitrary property for chart CSS variable
  const chartVarClass = isPositive ? "var(--chart-green)" : "var(--chart-red)";

  return (
    <div
      className={cn(
        "min-h-[250px] rounded-3xl bg-gradient-to-t p-5 text-white inset-shadow-sm inset-shadow-white/20",
        current.regularMarketChangePercent >= 0
          ? "from-green-900 to-green-800 dark:from-green-950 dark:to-green-900"
          : "from-red-900 to-red-800 dark:from-red-950 dark:to-red-900",
      )}
    >
      <div className="grid grid-rows-2 gap-4 tracking-tighter md:grid-cols-2 md:grid-rows-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-8 overflow-hidden rounded shadow-sm shadow-black/20"
              viewBox="0 0 7410 3900"
              preserveAspectRatio="xMinYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <path d="M0,0h7410v3900H0" fill="#b31942" />
              <path
                d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0"
                stroke="#FFF"
                strokeWidth={300}
              />
              <path d="M0,0h2964v2100H0" fill="#0a3161" />
              <g fill="#FFF">
                <g id="s18">
                  <g id="s9">
                    <g id="s5">
                      <g id="s4">
                        <path
                          id="s"
                          d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z"
                        />
                        <use xlinkHref="#s" y={420} />
                        <use xlinkHref="#s" y={840} />
                        <use xlinkHref="#s" y={1260} />
                      </g>
                      <use xlinkHref="#s" y={1680} />
                    </g>
                    <use xlinkHref="#s4" x={247} y={210} />
                  </g>
                  <use xlinkHref="#s9" x={494} />
                </g>
                <use xlinkHref="#s18" x={988} />
                <use xlinkHref="#s9" x={1976} />
                <use xlinkHref="#s5" x={2470} />
              </g>
            </svg>

            <h2 className="text-lg font-semibold text-shadow-xs">US Market</h2>
          </div>

          <div>
            {marketsData.map((m) => (
              <div
                key={m.ticker}
                onClick={() => onRowClick(m.ticker)}
                className={cn(
                  "dark:hover:bg-background-primary/20 flex flex-row items-center justify-between rounded-md px-3 py-2 transition-colors ease-out text-shadow-xs hover:bg-black/20",
                  currentTicker === m.ticker
                    ? "dark:bg-background-primary/20 bg-black/20 inset-shadow-sm inset-shadow-black/20"
                    : "",
                )}
              >
                <p className="font-bold">{m.title}</p>
                <p className="font-nunito grow text-right text-sm font-bold">
                  {currencyFormatter.format(m.price)}
                </p>
                <p
                  className={cn(
                    "font-nunito min-w-24 text-right text-sm font-bold",
                    m.regularMarketChangePercent > 0
                      ? "text-green-500 dark:text-green-600"
                      : "text-red-500 dark:text-red-600",
                  )}
                >
                  {m.regularMarketChangePercent > 0 ? "+" : ""}
                  {m.regularMarketChangePercent.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-[20px] bg-black/20 inset-shadow-sm inset-shadow-black/20">
          <MarketChart data={chartData} color={chartVarClass} height="100%" />
        </div>
      </div>
    </div>
  );
}
