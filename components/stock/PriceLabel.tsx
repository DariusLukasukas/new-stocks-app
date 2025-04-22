"use client";
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
    <div className="font-semibold">
      <div className="text-muted-foreground flex items-center">
        {label}
        {icon && <p className="ml-1">{icon}</p>}
      </div>
      <div className="space-x-2 text-lg font-bold md:text-xl">
        <span>
          {dollars}
          <span className="text-muted-foreground">.{decimals}</span>
        </span>
        <span className={cn(change > 0 ? "text-green-500" : "text-red-500")}>
          {change > 0 ? "+" : ""}
          {change.toFixed(2)}
        </span>
        <span
          className={cn(changePercent > 0 ? "text-green-500" : "text-red-500")}
        >
          ({changePercent > 0 ? "+" : ""}
          {formatPercentage(changePercent)})
        </span>
      </div>
    </div>
  );
}
