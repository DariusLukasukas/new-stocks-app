"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

const IMAGES = [
  "/images/image1.webp",
  "/images/image2.webp",
  "/images/image3.webp",
];

export default function SlideShow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full">
      <AnimatePresence initial={false}>
        {IMAGES.map((src, i) =>
          i === current ? (
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src={src}
                alt={`Slide ${i + 1}`}
                fill
                quality={100}
                priority={i === 0}
                className="object-cover object-top md:p-2"
              />
            </motion.div>
          ) : null,
        )}
      </AnimatePresence>
    </div>
  );
}
