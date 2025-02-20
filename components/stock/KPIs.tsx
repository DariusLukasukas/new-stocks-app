import yahooFinance from "yahoo-finance2";
import { cn } from "@/lib/utils";

// Formatters
const formatMarketCap = (value: number): string => {
  if (!value) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value}`;
};

const formatPercent = (value: number): string =>
  value != null ? `${(value * 100).toFixed(2)}%` : "N/A";

const formatNumber = (value: number): string =>
  value != null ? value.toFixed(2) : "N/A";

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

// Helper to safely access nested values using optional chaining
const getNestedValue = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

interface KPIData {
  label: string;
  key: string;
  formatter?: (value: number) => string;
}

const KPIS_DATA: KPIData[] = [
  {
    label: "Market Cap",
    key: "summaryDetail.marketCap",
    formatter: formatMarketCap,
  },
  {
    label: "P/E Ratio",
    key: "summaryDetail.trailingPE",
    formatter: formatNumber,
  },
  {
    label: "EPS",
    key: "defaultKeyStatistics.trailingEps",
    formatter: formatPrice,
  },
  {
    label: "Profit Margins",
    key: "defaultKeyStatistics.profitMargins",
    formatter: formatPercent,
  },
  {
    label: "Price/Sales",
    key: "summaryDetail.priceToSalesTrailing12Months",
    formatter: formatNumber,
  },
  {
    label: "Dividend Yield",
    key: "summaryDetail.dividendYield",
    formatter: formatPercent,
  },
  { label: "Short Ratio", key: "defaultKeyStatistics.shortRatio" },
  { label: "Beta", key: "summaryDetail.beta", formatter: formatNumber },
];

async function getStockData(ticker: string) {
  return yahooFinance.quoteSummary(ticker, {
    modules: ["summaryDetail", "defaultKeyStatistics"],
  });
}

interface KPIsProps {
  ticker: string;
}

interface KPIItemProps {
  label: string;
  value: number | null;
  formatter?: (value: number) => string;
}

const KPIItem = ({ label, value, formatter }: KPIItemProps) => {
  const formattedValue =
    value != null ? (formatter ? formatter(value) : value) : "N/A";
  return (
    <div className="flex w-full flex-row items-center justify-between py-2 lg:flex-col">
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
      <div
        className={cn("font-medium", {
          "text-muted-foreground": formattedValue === "N/A",
        })}
      >
        {formattedValue}
      </div>
    </div>
  );
};

export default async function KPIs({ ticker }: KPIsProps) {
  const stock = await getStockData(ticker);

  if (!stock) {
    return null;
  }
  return (
    <>
      {KPIS_DATA.map(({ label, key, formatter }) => {
        const value = getNestedValue(stock, key);
        return (
          <KPIItem
            key={key}
            label={label}
            value={value}
            formatter={formatter}
          />
        );
      })}
    </>
  );
}
