import { cn } from "@/lib/utils";
import Link from "next/link";

type NavProps = {
  label: string;
  href: string;
  className?: string;
};

const NAV: NavProps[] = [
  { label: "Pricing", href: "/" },
  { label: "Log in", href: "/login" },
];

export default function HomepageDock() {
  return (
    <div className="sticky top-0 z-10">
      <nav className="bg-background-secondary/80 absolute top-4 left-1/2 h-15 w-full max-w-xl -translate-x-1/2 rounded-full p-2 backdrop-blur-xl">
        <div className="flex h-full flex-row items-center justify-between">
          <div className="flex grow items-center px-5">
            <div className="text-xl font-extrabold">Onyx</div>
          </div>

          {NAV.map(({ label, href, className }, index) => (
            <Link
              key={index}
              href={href}
              className={cn(
                "mx-5 font-semibold transition-opacity ease-out hover:opacity-80",
                className,
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
