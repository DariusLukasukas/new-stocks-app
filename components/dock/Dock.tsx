"use client";
import {
  BookMarked,
  ChartLine,
  Cog,
  Home,
  Newspaper,
  NotebookText,
} from "lucide-react";
import { useTheme } from "next-themes";

interface DockItem {
  label: string;
  link: string;
  icon: React.ReactNode;
}

const DATA: DockItem[] = [
  {
    label: "Home",
    link: "/",
    icon: <Home className="size-6 stroke-[1.5px]" />,
  },
  {
    label: "News",
    link: "/news",
    icon: <Newspaper className="size-6 stroke-[1.5px]" />,
  },
  {
    label: "Screener",
    link: "/screener",
    icon: <ChartLine className="size-6 stroke-[1.5px]" />,
  },
  {
    label: "Watchlist",
    link: "/watchlist",
    icon: <BookMarked className="size-6 stroke-[1.5px]" />,
  },
  {
    label: "Notes",
    link: "/notes",
    icon: <NotebookText className="size-6 stroke-[1.5px]" />,
  },
  {
    label: "Settings",
    link: "/settings",
    icon: <Cog className="size-6 stroke-[1.5px]" />,
  },
];

export default function Dock() {
  const { setTheme } = useTheme();

  return (
    <nav className="fixed bottom-4 left-0 flex w-full justify-center gap-2">
      <div className="flex items-end space-x-4 rounded-full border p-2 shadow-lg backdrop-blur-sm">
        {DATA.map((item, index) => (
          <button
            key={index}
            className="bg-background text-muted-foreground flex size-10 items-center justify-center rounded-full border"
          >
            {item.icon}
          </button>
        ))}
      </div>
      <div className="flex items-end space-x-4 rounded-full border p-2 shadow-lg backdrop-blur-sm">
        {["light", "dark", "system"].map((item) => (
          <button
            key={item}
            className="bg-background size-10 rounded-full border"
            onClick={() => setTheme(item)}
          >
            {item[0].toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}
