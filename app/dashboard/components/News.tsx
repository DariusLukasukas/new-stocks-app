import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const apiKey = process.env.FMP_API_KEY;

type NewsResponse = {
  title: string;
  date: string;
  content: string;
  tickers: string;
  image: string;
  link: string;
  author: string;
  site: string;
};

export default async function News() {
  const res = await fetch(
    `https://financialmodelingprep.com/stable/fmp-articles?page=0&limit=20&apikey=${apiKey}`,
  );
  const data: NewsResponse[] = await res.json();

  return (
    <div className="bg-background-secondary h-auto min-h-[250px] w-full rounded-3xl p-5 inset-shadow-sm inset-shadow-white/20">
      <h2 className="py-2 text-lg font-semibold tracking-tighter">News</h2>

      <div>
        {data.slice(0, 5).map((news) => (
          <div key={news.title} className="mb-4">
            <div className="text-text-secondary flex flex-row gap-2 text-sm font-medium">
              <p>{news.site}</p>
              <p>{news.tickers}</p>
            </div>
            <h3 className="text-base font-semibold">{news.title}</h3>
          </div>
        ))}
      </div>
      <div className="flex flex-row items-center justify-end gap-1 py-2">
        <Button
          size={"icon"}
          variant={"secondary"}
          className="bg-background-primary size-7 shadow-none"
        >
          <ArrowLeft strokeWidth={2.5} />
        </Button>
        <Button
          size={"icon"}
          variant={"secondary"}
          className="bg-background-primary size-7 shadow-none"
        >
          <ArrowRight strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
