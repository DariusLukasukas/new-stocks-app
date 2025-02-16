"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export default function GoBack() {
  const router = useRouter();
  return (
    <Button size="icon" variant="ghost" onClick={() => router.back()}>
      <ChevronLeft />
    </Button>
  );
}
