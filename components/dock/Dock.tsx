"use client";
import { Bolt, Home } from "lucide-react";
import { useTheme } from "next-themes";

interface DockItem {
  label: string;
  link: string;
  icon: React.ReactNode;
}

const DATA: DockItem[] = [
  { label: "Home", link: "/", icon: <Home /> },
  { label: "Settings", link: "/settings", icon: <Bolt /> },
];

export default function Dock() {
  const { setTheme } = useTheme();

  return (
    <nav className="fixed bottom-4 left-0 flex w-full justify-center gap-2">
      <div className="flex items-end space-x-4 rounded-full border p-2 shadow-lg backdrop-blur-sm">
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            className="bg-background size-10 rounded-full border"
          >
            {item}
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
