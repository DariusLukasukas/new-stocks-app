import Note from "../notes/Note";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const DATA = [
  { label: "Notes", active: true },
  { label: "News" },
  { label: "Earnings" },
  { label: "About" },
];

export default function Widget() {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative min-h-[400px] w-full max-w-md">
        {/* MAIN */}
        <Card className="z-20 h-full min-h-96">
          <CardHeader className="pb-4 select-none">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Note />
          </CardContent>
        </Card>

        {/* BACKGROUND  STACK*/}
        <Card className="absolute top-3 -right-1.5 -z-10 h-[340px] w-32 rotate-2 bg-zinc-100 dark:bg-zinc-700" />
        <Card className="absolute top-6 -right-2 -z-20 h-[340px] w-32 rotate-5 bg-zinc-200 dark:bg-zinc-900" />
      </div>

      {/* NAVIGATION */}
      <div className="space-x-2">
        {DATA.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={item.active ? "bg-accent" : "text-muted-foreground"}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
