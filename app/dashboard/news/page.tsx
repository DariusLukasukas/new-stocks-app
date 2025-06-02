import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetGeneralNews, topNews } from "./actions";
import Link from "next/link";

function formatDateTime(unixSec: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(unixSec * 1000));
}

export default async function Page() {
  const news: topNews[] = await GetGeneralNews();
  // 1) Prepare “today” and “yesterday” markers
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // 2) Helper: decide which bucket a timestamp belongs in
  function getBucket(dt: number) {
    const d = new Date(dt * 1000);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    // Otherwise show e.g. "Apr 20, 2025"
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // 3) Group into a Record<string, topNews[]>
  const grouped = news.reduce<Record<string, topNews[]>>((acc, item) => {
    const key = getBucket(item.datetime);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <div className="leading-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {"What's happening"}
        </h2>
        <p className="text-text-secondary font-medium">
          {"We've gathered the latest market news for you."}
        </p>
      </div>

      <div className="col-span-2 mb-24 flex flex-col gap-8 px-1">
        {Object.entries(grouped).map(([bucket, items]) => (
          <Card
            key={bucket}
            className="bg-background-secondary overflow-visible rounded-3xl border-none shadow-none"
          >
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">{bucket}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  prefetch={false}
                  tabIndex={0}
                  className="block rounded-xl p-6 focus:outline-3 focus:outline-blue-500"
                >
                  <div className="text-text-secondary text-sm font-medium">
                    {formatDateTime(item.datetime)}
                  </div>
                  <div className="font-semibold">{item.summary}</div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
