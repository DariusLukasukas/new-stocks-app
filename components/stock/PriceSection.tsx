import { cn } from "@/lib/utils";

interface PriceSectionProps {
  label: string;
  price: number;
  change: number;
  changePercent: number;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function PriceSection({
  label,
  price,
  change,
  changePercent,
}: PriceSectionProps) {
  const formattedPrice = formatUSD(price);
  const [dollars, decimals] = formattedPrice.split(".");

  return (
    <div>
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="space-x-2">
        <span className="text-3xl font-bold">
          {dollars}
          <span className="text-muted-foreground">.{decimals}</span>
        </span>
        <span
          className={cn(
            "text-xl font-semibold mr-1",
            change > 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(2)}
        </span>
        <span
          className={cn(
            "text-xl font-semibold",
            changePercent > 0 ? "text-green-500" : "text-red-500"
          )}
        >
          ({changePercent > 0 ? "+" : ""}
          {formatPercentage(changePercent)})
        </span>
      </div>
    </div>
  );
}
