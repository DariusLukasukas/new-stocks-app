import { cn } from "@/lib/utils";
import Link from "next/link";
import { MarketTrendsClient } from "./MarketTrendsClient";

const apiKey = process.env.FMP_API_KEY;

const ENDPOINTS: Record<string, string> = {
  "most-actives": "https://financialmodelingprep.com/stable/most-actives",
  "biggest-gainers": "https://financialmodelingprep.com/stable/biggest-gainers",
  "biggest-losers": "https://financialmodelingprep.com/stable/biggest-losers",
};

export const revalidate = 3600;

export default async function MarketTrends({
  market = "most-actives",
}: {
  market?: string;
}) {
  const normalizedMarket = market in ENDPOINTS ? market : "most-actives";
  const res = await fetch(`${ENDPOINTS[normalizedMarket]}?apikey=${apiKey}`);
  const data = await res.json();

  const tabs = [
    { label: "Most active", value: "most-actives" },
    { label: "Biggest gainers", value: "biggest-gainers" },
    { label: "Biggest losers", value: "biggest-losers" },
  ];

  return (
    <div className="bg-background-secondary h-auto min-h-[528px] w-full rounded-3xl p-5 inset-shadow-sm inset-shadow-white/20">
      <h2 className="py-2 text-lg font-semibold tracking-tighter">
        Market trends
      </h2>

      {/* Tab bar */}
      <div className="bg-background-primary flex rounded-lg p-1 font-medium tracking-tighter">
        {tabs.map((tab) => {
          const isActive = tab.value === normalizedMarket;
          return (
            <Link
              key={tab.value}
              href={`?market=${tab.value}`}
              className={cn(
                "w-full rounded-md p-1 text-center transition-colors",
                isActive
                  ? "bg-background-secondary text-text-primary font-semibold inset-shadow-sm inset-shadow-white/20"
                  : "text-text-tertiary",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <MarketTrendsClient data={data} />
    </div>
  );
}
