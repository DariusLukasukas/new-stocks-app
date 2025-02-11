import React from "react";

export default function Dock() {
  return (
    <div className="fixed bottom-4 left-0 w-full flex justify-center">
      <div className="flex items-end space-x-4 bg-zinc-100/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-zinc-200">
        {[1, 2, 3, 4, 5].map((item) => (
          <button key={item} className="size-10 bg-zinc-200 rounded-full">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
