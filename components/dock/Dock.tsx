"use client";
import {
  BookMarked,
  ChartNoAxesCombined,
  Cog,
  Home,
  Newspaper,
  NotebookText,
} from "lucide-react";
import ThemeToggleDynamic from "../ui/theme-toggle-dynamic";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DockItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const DATA: DockItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home />,
  },
  {
    label: "News",
    href: "/news",
    icon: <Newspaper />,
  },
  {
    label: "Screener",
    href: "/screener",
    icon: <ChartNoAxesCombined />,
    disabled: true,
  },
  {
    label: "Watchlist",
    href: "/watchlist",
    icon: <BookMarked />,
  },
  {
    label: "Notes",
    href: "/notes",
    icon: <NotebookText />,
    disabled: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Cog />,
  },
];

export default function Dock() {
  return (
    <div className="fixed bottom-4 z-50 w-full">
      <div className="container mx-auto flex items-center justify-center">
        <nav className="animate-dock-slide-up dark:bg-background/10 flex items-center gap-4 rounded-full border bg-neutral-200/50 p-2 shadow-lg backdrop-blur-sm transition-transform will-change-transform">
          {DATA.map((item, index) => (
            <button
              key={index}
              disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
              className="bg-background text-muted-foreground hover:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 flex size-10 items-center justify-center rounded-full border focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-invalid:focus-visible:ring-0"
            >
              <Link
                href={item.href}
                className={cn(item.disabled && "pointer-events-none")}
                aria-disabled={item.disabled}
              >
                {item.icon}
              </Link>
            </button>
          ))}
          <ThemeToggleDynamic />
        </nav>
      </div>
    </div>
  );
}
