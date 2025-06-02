"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Range({
  RANGE_OPTIONS,
}: {
  RANGE_OPTIONS: { label: string; value: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultRange = RANGE_OPTIONS[0].value;
  // if there’s no ?range=… in the URL, fall back to defaultRange
  const urlRange = searchParams.get("range") ?? defaultRange;

  const [selected, setSelected] = useState<string>(urlRange);

  // keep local state in sync if url changes (back/forward nav)
  useEffect(() => {
    setSelected(urlRange);
  }, [urlRange]);

  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleClick = (value: string) => {
    if (value == selected) return;

    // immediate UI update
    setSelected(value);

    // push URL in a non-blocking way
    startTransition(() => {
      router.replace(`${pathname}?${createQueryString("range", value)}`, {
        scroll: false,
      });
    });
  };

  return (
    <LayoutGroup>
      <motion.div
        layout
        role="tablist"
        aria-label="Select data range"
        className="bg-background-tertiary relative flex w-fit flex-row gap-2 rounded-full p-1 text-sm"
      >
        {RANGE_OPTIONS.map(({ value, label }) => {
          const isSelected = value === selected;
          return (
            <motion.button
              key={value}
              role="tab"
              aria-selected={isSelected}
              disabled={isPending && isSelected}
              onClick={() => handleClick(value)}
              className="relative flex px-4 py-1.5 select-none"
            >
              <span
                className={cn(
                  "z-10 font-semibold whitespace-nowrap transition-colors duration-300 ease-in",
                  isSelected
                    ? "text-text-primary font-bold"
                    : "text-text-tertiary",
                )}
              >
                {label}
              </span>
              {isSelected ? (
                <motion.div
                  layoutId="range-indicator"
                  className="bg-background-primary absolute inset-0 -z-0 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ) : null}
            </motion.button>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}
