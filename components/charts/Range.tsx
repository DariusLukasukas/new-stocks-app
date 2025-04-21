"use client";

import { useCallback } from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Range({
  RANGE_OPTIONS,
}: {
  RANGE_OPTIONS: { label: string; value: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = searchParams.get("range") ?? RANGE_OPTIONS[0].value;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <div className="space-x-2">
      {RANGE_OPTIONS.map((option) => (
        <Button
          key={option.label}
          variant={"secondary"}
          onClick={() => {
            router.push(
              pathname + "?" + createQueryString("range", option.value),
              { scroll: false },
            );
          }}
          className={`${
            active === option.value ? "font-bold" : ""
          } transition-colors duration-200 ease-in-out`}
          aria-label={`Select ${option.label} range`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
