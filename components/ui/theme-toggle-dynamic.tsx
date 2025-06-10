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
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "text-text-primary flex size-11 cursor-pointer items-center justify-center rounded-full transition ease-in-out hover:scale-95 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50",
        animation && "animate-theme-spin",
      )}
      title="Toggle Theme"
      tabIndex={0}
      aria-label="Toggle Theme"
    >
      {mounted ? <ThemeIcon /> : <div className="block size-10 rounded-full" />}
    </button>
  );
}
