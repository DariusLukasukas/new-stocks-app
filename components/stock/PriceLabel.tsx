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
    <div className="leading-8">
      <div className="text-text-primary flex items-center text-xl font-bold md:text-xl">
        {label}
        {icon && <p className="ml-1">{icon}</p>}
      </div>
      <div className="font-nunito flex flex-row items-end gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
        <p className="flex items-baseline">
          {dollars}
          <span className="text-text-secondary">.{decimals}</span>
        </p>
        <p className={change > 0 ? "text-green-500" : "text-red-500"}>
          {change > 0 ? "+" : ""}
          {change.toFixed(2)}
        </p>
        <p
          className={cn(changePercent > 0 ? "text-green-500" : "text-red-500")}
        >
          {changePercent > 0 ? "+" : ""}
          {formatPercentage(changePercent)}
        </p>
      </div>
    </div>
  );
}
