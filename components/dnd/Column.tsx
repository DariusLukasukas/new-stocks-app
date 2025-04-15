"use client";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

export default function Column({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { ref } = useDroppable({
    id,
    type: "column",
    accept: ["item"],
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      ref={ref}
      className="flex min-w-3xs flex-col gap-2 rounded-lg bg-neutral-100 p-5"
    >
      {children}
    </div>
  );
}
