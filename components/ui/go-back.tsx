"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { ChevronLeft } from "lucide-react";

export default function GoBack() {
  const router = useRouter();
  return (
    <Button size="icon" variant="secondary" onClick={() => router.back()}>
      <ChevronLeft strokeWidth={2.5} />
    </Button>
  );
}
