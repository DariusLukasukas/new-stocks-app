"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggleDynamic() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animation, setAnimation] = useState(false);

  // Avoid hydration issues: Only render once the client is mounted.
  useEffect(() => setMounted(true), []);

  // When using "system", use the resolvedTheme to determine the actual theme.
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const toggleTheme = () => {
    if (animation) return;
    setAnimation(true);

    setTimeout(() => {
      setTheme(currentTheme === "dark" ? "light" : "dark");
      setAnimation(false);
    }, 1000);
  };

  const ThemeIcon = currentTheme === "dark" ? Sun : Moon;
  //
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "bg-glass-background-secondary text-glass-text-secondary hover:text-glass-text-primary ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 hover:bg-glass-background-secondary-hover flex size-11 cursor-pointer items-center justify-center rounded-full transition-all ease-out focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-invalid:focus-visible:ring-0",
        animation && "animate-theme-spin",
      )}
      title="Toggle Theme"
    >
      {mounted ? <ThemeIcon /> : <div className="block size-10 rounded-full" />}
    </button>
  );
}
