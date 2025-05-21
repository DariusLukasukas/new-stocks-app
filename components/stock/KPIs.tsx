import { cn } from "@/lib/utils";
import type { StockData } from "@/types/yahooFinance";

type Formatter = (v: number) => string;
interface KPIConfig {
  label: string;
  getValue: (d: StockData) => number | null;
  formatter?: Formatter;
}

const formatMarketCap: Formatter = (v) =>
  v >= 1e12
    ? `$${(v / 1e12).toFixed(2)}T`
    : v >= 1e9
      ? `$${(v / 1e9).toFixed(2)}B`
      : v >= 1e6
        ? `$${(v / 1e6).toFixed(2)}M`
        : `$${v.toFixed(0)}`;

const formatPercent: Formatter = (v) => `${(v * 100).toFixed(2)}%`;
const formatNumber: Formatter = (v) => v.toFixed(2);
const formatPrice: Formatter = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    v,
  );

const KPI_CONFIGS: KPIConfig[] = [
  {
    label: "Market Cap",
    getValue: (d) => d.summaryDetail?.marketCap ?? null,
    formatter: formatMarketCap,
  },
  {
    label: "P/E Ratio",
    getValue: (d) => d.summaryDetail?.trailingPE ?? null,
    formatter: formatNumber,
  },
  {
    label: "EPS",
    getValue: (d) => d.defaultKeyStatistics?.trailingEps ?? null,
    formatter: formatPrice,
  },
  {
    label: "Profit Margins",
    getValue: (d) => d.defaultKeyStatistics?.profitMargins ?? null,
    formatter: formatPercent,
  },
  {
    label: "Price/Sales",
    getValue: (d) => d.summaryDetail?.priceToSalesTrailing12Months ?? null,
    formatter: formatNumber,
  },
  {
    label: "Dividend Yield",
    getValue: (d) => d.summaryDetail?.dividendYield ?? null,
    formatter: formatPercent,
  },
  {
    label: "Short Ratio",
    getValue: (d) => d.defaultKeyStatistics?.shortRatio ?? null,
  },
  {
    label: "Beta",
    getValue: (d) => d.summaryDetail?.beta ?? null,
    formatter: formatNumber,
  },
];

export default function KPIs({ data }: { data: StockData }) {
  // If key modules are missing
  if (!data.summaryDetail || !data.defaultKeyStatistics) {
    return <div>No data available</div>;
  }

  return (
    <>
      {KPI_CONFIGS.map(({ label, getValue, formatter }) => {
        const raw = getValue(data);
        const display =
          raw != null ? (formatter ? formatter(raw) : raw.toString()) : "N/A";

        return (
          <div
            key={label}
            className="flex w-full items-center justify-between py-2 lg:flex-col"
          >
            <div className="text-muted-foreground font-medium">{label}</div>
            <div
              className={cn("font-mono font-medium tabular-nums", {
                "text-muted-foreground": display === "N/A",
              })}
            >
              {display}
            </div>
          </div>
        );
      })}
    </>
  );
}
