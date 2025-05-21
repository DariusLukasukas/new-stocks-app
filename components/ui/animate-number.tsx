"use client";
import { motion, MotionConfig } from "motion/react";
import NumberFlow, { useCanAnimate } from "@number-flow/react";

const MotionNumberFlow = motion.create(NumberFlow);

type AnimateNumberProps = {
  value: number;
};

export default function AnimateNumber({ value }: AnimateNumberProps) {
  const canAnimate = useCanAnimate();

  return (
    <MotionConfig
      // Disable layout animations if NumberFlow can't animate.
      // This worked better than setting layout={canAnimate}
      transition={{
        layout: canAnimate
          ? { duration: 0.9, bounce: 0, type: "spring" }
          : { duration: 0 },
      }}
    >
      <MotionNumberFlow
        value={value}
        className="font-semibold"
        format={{ style: "percent", maximumFractionDigits: 2 }}
        style={{
          "--number-flow-char-height": "0.85em",
          "--number-flow-mask-height": "0.3em",
        }}
        layout
        layoutRoot
      />
    </MotionConfig>
  );
}
