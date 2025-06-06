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
    href: "/dashboard",
    icon: <Home size={24} absoluteStrokeWidth={true} />,
  },
  {
    label: "News",
    href: "/dashboard/news",
    icon: <Newspaper size={24} absoluteStrokeWidth={true} />,
  },
  {
    label: "Screener",
    href: "/dashboard/screener",
    icon: <ChartNoAxesCombined size={24} absoluteStrokeWidth={true} />,
    disabled: true,
  },
  {
    label: "Watchlist",
    href: "/dashboard/watchlist",
    icon: <BookMarked size={24} absoluteStrokeWidth={true} />,
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: <NotebookText size={24} absoluteStrokeWidth={true} />,
    disabled: true,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Cog size={24} absoluteStrokeWidth={true} />,
  },
];

export default function Dock() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 mx-auto w-fit -translate-x-1/2">
      <div className="container mx-auto flex items-center justify-center">
        <nav className="animate-dock-slide-up bg-glass-background-primary shadow-s flex items-center gap-4 rounded-full p-2 backdrop-blur-sm transition-transform will-change-transform">
          {DATA.map((item, index) => (
            <button
              key={index}
              disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
              className="bg-glass-background-secondary text-glass-text-secondary hover:text-glass-text-primary ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 hover:bg-glass-background-secondary-hover flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors ease-in-out focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-invalid:focus-visible:ring-0"
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
