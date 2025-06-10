import MarketTrends from "./components/MarketTrends";
import Markets from "./components/Markets";
import Commodities from "./components/Commodities";
import SectorPerformance from "./components/SectorPerformance";
import News from "./components/News";

export const revalidate = 3600; // invalidate every hour

export default async function Page({
  searchParams,
}: {
  searchParams?: { market?: string; ticker?: string };
}) {
  const market = searchParams?.market || "most-actives";
  const ticker = searchParams?.ticker || "^DJI";

  return (
    <div className="grid grid-cols-1 items-start gap-4 pt-2 md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-2">
        <Markets ticker={ticker} />
      </div>
      <div className="row-span-2">
        <SectorPerformance />
      </div>
      <div>
        <Commodities />
      </div>
      <MarketTrends market={market} />
      <div className="col-span-2">
        <News />
      </div>
    </div>
  );
}
