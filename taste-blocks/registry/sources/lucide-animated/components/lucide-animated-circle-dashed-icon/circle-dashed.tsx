"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../lib/utils";

export interface CircleDashedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CircleDashedIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const PATH_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: (i: number) => ({
    opacity: [0, 1],
    transition: { delay: i * 0.04, duration: 0.28 },
  }),
};

const CircleDashedIcon = forwardRef<
  CircleDashedIconHandle,
  CircleDashedIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 28, isAnimated = true, ...props }, ref) => {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => (!isAnimated || reduced ? controls.start("normal") : controls.start("animate")),
      stopAnimation: () => controls.start("normal"),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAnimated || reduced) {
        controls.start("normal");
        onMouseEnter?.(e);
        return;
      }
        if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start("animate");
      }
    },
    [controls, isAnimated, onMouseEnter, reduced]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start("normal");
      }
    },
    [controls, onMouseLeave]
  );

  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {[
          "M10.1 2.182a10 10 0 0 1 3.8 0",
          "M13.9 21.818a10 10 0 0 1-3.8 0",
          "M17.609 3.721a10 10 0 0 1 2.69 2.7",
          "M2.182 13.9a10 10 0 0 1 0-3.8",
          "M20.279 17.609a10 10 0 0 1-2.7 2.69",
          "M21.818 10.1a10 10 0 0 1 0 3.8",
          "M3.721 6.391a10 10 0 0 1 2.7-2.69",
          "M6.391 20.279a10 10 0 0 1-2.69-2.7",
        ].map((d, index) => (
          <motion.path
            animate={controls}
            custom={index + 1}
            d={d}
            key={d}
            variants={PATH_VARIANTS}
          />
        ))}
      </svg>
    </div>
  );
});

CircleDashedIcon.displayName = "CircleDashedIcon";

export { CircleDashedIcon };
