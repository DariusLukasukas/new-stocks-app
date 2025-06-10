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
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  return (
    <div className="fixed bottom-3 left-1/2 z-50 mx-auto w-fit -translate-x-1/2">
      <div className="container mx-auto flex items-center justify-center">
        <nav className="animate-dock-slide-up bg-background-tertiary/10 flex items-center gap-4 rounded-full border-b border-white/40 p-2 shadow inset-shadow-sm inset-shadow-white backdrop-blur-md backdrop-brightness-110 backdrop-saturate-200 transition will-change-transform dark:border-white/10 dark:inset-shadow-white/50">
          {DATA.map((item, idx) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={idx}
                disabled={item.disabled}
                tabIndex={item.disabled ? -1 : 0}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition hover:scale-95",
                  item.disabled && "pointer-events-none opacity-50",
                  isActive ? "text-blue-500" : "text-text-primary",
                )}
              >
                <Link
                  href={item.href}
                  className={cn(item.disabled && "pointer-events-none")}
                  aria-disabled={item.disabled}
                >
                  {item.icon}
                </Link>
              </button>
            );
          })}
          <ThemeToggleDynamic />
        </nav>
      </div>
    </div>
  );
}
