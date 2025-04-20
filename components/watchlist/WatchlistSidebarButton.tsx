"use client";

import { PanelRightOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";

export default function WatchlistSidebarButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed top-3 right-3">
          <Button
            size={"icon"}
            variant={"ghost"}
            aria-label="Open watchlist in sidebar"
          >
            <PanelRightOpen />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-md px-6 py-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <SheetTitle className="sr-only">Watchlist</SheetTitle>
        <SheetDescription className="sr-only">
          Manage your watchlist and track your favorite stocks.
        </SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  );
}
