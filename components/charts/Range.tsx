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
          onClick={() => {
            router.push(
              pathname + "?" + createQueryString("range", option.value),
              { scroll: false },
            );
          }}
          variant={"custom"}
          // disabled={range === option.value}
          className="bg-neutral-100 select-none hover:bg-neutral-200"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
