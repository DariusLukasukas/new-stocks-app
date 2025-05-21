import Range from "@/components/charts/Range";
import { RANGE_OPTIONS } from "@/components/charts/StockAreaChart";

export default async function Home() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Range RANGE_OPTIONS={RANGE_OPTIONS}/>
    </div>
  );
}
