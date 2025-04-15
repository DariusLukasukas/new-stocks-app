"use client";
import { useSortable } from "@dnd-kit/react/sortable";

export default function Item({
  id,
  column,
  index,
}: {
  id: string;
  column: string;
  index: number;
}) {
  const { ref } = useSortable({
    id,
    index,
    group: column,
    type: "item",
    accept: ["item"],
  });

  return (
    <div ref={ref} className="bg-card rounded-lg border p-2">
      {id}
    </div>
  );
}
