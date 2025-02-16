import Note from "@/components/notes/Note";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DATA = [
  { label: "Notes", active: true },
  { label: "News" },
  { label: "Earnings" },
  { label: "About" },
];

export default function Home() {
  return (
    <div className="container mx-auto p-2">
      <div className="relative w-full max-w-md">
        <Note />
        <Card className="absolute top-3 -right-1.5 -z-10 h-[340px] w-32 rotate-2 bg-zinc-100 dark:bg-zinc-700" />
        <Card className="absolute top-6 -right-2 -z-20 h-[340px] w-32 rotate-5 bg-zinc-200 dark:bg-zinc-900" />
      </div>
      <div className="mt-4 space-x-2">
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
