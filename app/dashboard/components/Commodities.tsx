import { getStockData } from "@/components/watchlist/actions";
import { cn } from "@/lib/utils";

const COMMODITIES = [
  { ticker: "ZF=F", name: "Five Year US Treasury Note" },
  { ticker: "GC=F", name: "Gold", category: "Precious Metal" },
  { ticker: "SI=F", name: "Silver", category: "Precious Metal" },
  { ticker: "HG=F", name: "Copper", category: "Base Metal" },
  { ticker: "CL=F", name: "Crude Oil (WTI)", category: "Energy" },
  { ticker: "BZ=F", name: "Brent Crude Oil", category: "Energy" },
  { ticker: "NG=F", name: "Natural Gas", category: "Energy" },
  { ticker: "ZC=F", name: "Corn", category: "Agriculture" },
  { ticker: "ZS=F", name: "Soybeans", category: "Agriculture" },
  { ticker: "ZW=F", name: "Wheat", category: "Agriculture" },
  { ticker: "RB=F", name: "RBOB Gasoline", category: "Energy" },
];

export default async function Commodities() {
  // 1. Fetch all the commodity quotes
  const tickers = COMMODITIES.map((c) => c.ticker);
  const allQuotes = await getStockData(tickers);

  // 2. Massage into a uniform shape
  const tableData = COMMODITIES.map((c) => {
    const quote = allQuotes[c.ticker] || {};
    return {
      name: c.name,
      price: quote.price ?? 0,
      changePct: quote.regularMarketChangePercent ?? 0,
    };
  });

  // 3. Formatter
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return (
    <div className="bg-background-secondary h-auto min-h-[250px] w-full rounded-3xl p-5 inset-shadow-sm inset-shadow-white/20">
      <h2 className="py-2 text-lg font-semibold tracking-tighter">
        Commodities
      </h2>
      <table className="w-full border-collapse text-left">
        <tbody>
          {tableData.map((row) => {
            const positive = row.changePct >= 0;
            return (
              <tr
                key={row.name}
                className="hover:bg-background-primary/10 tracking-tight transition-colors"
              >
                <td className="py-2 font-semibold">{row.name}</td>
                <td className="font-nunito grow py-2 text-right text-sm font-bold">
                  {usd.format(row.price)}
                </td>
                <td
                  className={cn(
                    "font-nunito py-2 text-right text-sm font-bold",
                    positive ? "text-green-600" : "text-red-600",
                  )}
                >
                  {positive ? "+" : ""}
                  {row.changePct.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
