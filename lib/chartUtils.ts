/**
 * Calculates the starting date (period1) based on the given range.
 * Supported ranges: "1d", "1w", "1m", "3m", "1y".
 */
export function getPeriod1(range: string): string {
  const date = new Date();
  switch (range) {
    case "1d":
      date.setDate(date.getDate() - 1);
      break;
    case "1w":
      date.setDate(date.getDate() - 7);
      break;
    case "1m":
      date.setMonth(date.getMonth() - 1);
      break;
    case "3m":
      date.setMonth(date.getMonth() - 3);
      break;
    case "1y":
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      // Fallback to 1w if an unsupported range is provided.
      date.setDate(date.getDate() - 7);
      break;
  }
  return date.toISOString().split("T")[0];
}

/**
 * Returns an appropriate interval for the chart API based on the selected range.
 * For example, for a one-day range ("1d") it returns "1m"; for one week ("1w") it returns "15m", etc.
 */
export function getInterval(range: string): string {
  switch (range) {
    case "1d":
      return "1m"; // 1 day -> 1-minute interval
    case "1w":
      return "15m"; // 1 week -> 15-minute interval
    case "1m":
      return "30m"; // 1 month -> 30-minute interval
    case "3m":
      return "60m"; // 3 months -> 60-minute interval
    case "1y":
      return "1d"; // 1 year -> 1-day interval
    default:
      return "1d";
  }
}
