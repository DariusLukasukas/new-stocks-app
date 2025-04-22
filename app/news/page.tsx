import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetGeneralNews, topNews } from "./actions";

function formatDateTime(unixSec: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(unixSec * 1000));
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const ticker = (await searchParams).ticker;

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
      <h2 className="text-xl font-bold">{"What's happening"}</h2>

      <div className="col-span-2 mb-24 flex flex-col gap-8">
        {Object.entries(grouped).map(([bucket, items]) => (
          <Card
            key={bucket}
            className="bg-secondary dark:bg-secondary/50 rounded-3xl border-none shadow-none"
          >
            <CardHeader className="border-b py-4">
              <CardTitle>{bucket}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="text-muted-foreground text-xs font-medium">
                    {formatDateTime(item.datetime)}
                  </div>
                  <div className="font-medium">{item.summary}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
