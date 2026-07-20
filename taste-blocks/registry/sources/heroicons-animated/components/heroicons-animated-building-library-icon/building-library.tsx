"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface BuildingLibraryIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BuildingLibraryIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const DOT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
  },
  animate: {
    opacity: [0, 1],
    transition: {
      delay: 0.08,
      duration: 0.1,
    },
  },
};

const PILLAR_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: (custom: number) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      delay: 0.04 + custom * 0.04,
      duration: 0.28,
      ease: "linear",
    },
  }),
};

const PILLARS = [
  { d: "M8.25 12.75v8.25", index: 0 },
  { d: "M12 12.75v8.25", index: 1 },
  { d: "M15.75 12.75v8.25", index: 2 },
] as const;

const BuildingLibraryIcon = forwardRef<
  BuildingLibraryIconHandle,
  BuildingLibraryIconProps
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
      if (!isAnimated || reduced) return;
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
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
        <motion.path
          animate={controls}
          d="M12 6.75h.008v.008H12V6.75Z"
          initial="normal"
          variants={DOT_VARIANTS}
        />
        {PILLARS.map((pillar) => (
          <motion.path
            animate={controls}
            custom={pillar.index}
            d={pillar.d}
            initial="normal"
            key={pillar.index}
            variants={PILLAR_VARIANTS}
          />
        ))}
      </svg>
    </div>
  );
});

BuildingLibraryIcon.displayName = "BuildingLibraryIcon";

export { BuildingLibraryIcon };
