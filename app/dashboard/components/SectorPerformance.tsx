import { cn } from "@/lib/utils";

const apiKey = process.env.FMP_API_KEY;

type SectorPerformance = {
  sector: string;
  changesPercentage: string; // e.g. "0.07065%"
};
export default async function SectorPerformance() {
  const res = await fetch(
    `https://financialmodelingprep.com/api/v3/sectors-performance?apikey=${apiKey}`,
  );
  const data: SectorPerformance[] = await res.json();

  return (
    <div className="bg-background-secondary h-auto min-h-[250px] w-full rounded-3xl p-5 inset-shadow-sm inset-shadow-white/20">
      <h2 className="py-2 text-lg font-semibold tracking-tighter">
        Sector Performance
      </h2>
      {data.map(({ sector, changesPercentage }) => {
        // 1) Strip the “%” and parse to a number
        const raw = changesPercentage.replace("%", "").trim();
        const change = parseFloat(raw); // e.g. -0.19228

        // 2) Compute how many bars to fill:
        //    - Take the absolute value and round up
        //    - If that results in 0 but change !== 0, force it to 1
        let fillCount = Math.ceil(Math.abs(change));
        if (fillCount === 0 && change !== 0) {
          fillCount = 1;
        }
        // Now fillCount = 1 for |0.07|%, = 1 for |0.19|%, = 2 for |1.507|%, etc.

        // 3) Set up total bars and the “center” index (zero-point)
        const totalBars = 11;
        const centerIndex = Math.floor(totalBars / 2); // 5

        return (
          <div
            key={sector}
            className="flex flex-row items-center justify-between gap-1 py-2"
          >
            <h2 className="font-medium tracking-tighter">{sector}</h2>

            <p
              className={cn(
                "font-nunito ml-auto text-sm font-bold tracking-tight",
                change > 0
                  ? "text-green-600"
                  : change < 0
                    ? "text-red-600"
                    : "",
              )}
            >
              {change > 0 ? "+" : ""}
              {change.toFixed(2)}%
            </p>

            <div className="flex flex-row gap-1">
              {Array(totalBars)
                .fill(null)
                .map((_, index) => {
                  // Default “unfilled” color:
                  let barColor = "bg-neutral-200 dark:bg-neutral-700";

                  // 4) Handle the center (0%) bar at index = centerIndex (5):
                  if (index === centerIndex) {
                    if (change === 0) {
                      // Exactly 0% → highlight center in neutral
                      barColor = "bg-neutral-400 dark:bg-neutral-500";
                    } else {
                      // Nonzero → keep center slightly darker than unfilled
                      barColor = "bg-neutral-300 dark:bg-neutral-600";
                    }

                    // 5) Positive change: fill bars to the right of center
                  } else if (
                    change > 0 &&
                    index > centerIndex &&
                    index <= Math.min(totalBars - 1, centerIndex + fillCount)
                  ) {
                    barColor = "bg-green-500";

                    // 6) Negative change: fill bars to the left of center
                  } else if (
                    change < 0 &&
                    index < centerIndex &&
                    index >= Math.max(0, centerIndex - fillCount)
                  ) {
                    barColor = "bg-red-500";
                  }

                  return (
                    <div
                      key={index}
                      className={cn(
                        "h-6 w-2 rounded transition-colors duration-200",
                        barColor,
                      )}
                    />
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
