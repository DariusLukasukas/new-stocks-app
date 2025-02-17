import { cn } from "@/lib/utils";

interface PriceSectionProps {
  label: string;
  price?: number;
  change?: number;
  changePercent?: number;
  icon?: React.ReactNode;
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

export default function PriceLabel({
  label,
  price,
  change,
  changePercent,
  icon,
}: PriceSectionProps) {
  if (
    price === undefined ||
    change === undefined ||
    changePercent === undefined
  ) {
    return null;
  }

  const formattedPrice = formatUSD(price);
  const [dollars, decimals] = formattedPrice.split(".");

  return (
    <div>
      <div className="text-muted-foreground flex items-center font-medium">
        {label}
        {icon && <span className="ml-1">{icon}</span>}
      </div>
      <div className="space-x-2">
        <span className="text-lg font-bold lg:text-3xl">
          {dollars}
          <span className="text-muted-foreground">.{decimals}</span>
        </span>
        <span
          className={cn(
            "mr-1 text-lg font-semibold lg:text-xl",
            change > 0 ? "text-green-500" : "text-red-500",
          )}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(2)}
        </span>
        <span
          className={cn(
            "text-lg font-semibold lg:text-xl",
            changePercent > 0 ? "text-green-500" : "text-red-500",
          )}
        >
          ({changePercent > 0 ? "+" : ""}
          {formatPercentage(changePercent)})
        </span>
      </div>
    </div>
  );
}
