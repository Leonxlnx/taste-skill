"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface CalendarDateRangeIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CalendarDateRangeIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const FIRST_DOT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: {
    opacity: [1, 0.3, 1],
    transition: {
      delay: 0,
      duration: 0.28,
      times: [0, 0.5, 1],
    },
  },
};

const LINE_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: (custom: number) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      delay: 0.04 + custom * 0.04,
      duration: 0.28,
      ease: "easeOut",
    },
  }),
};

const DOT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: (custom: number) => ({
    opacity: [1, 0.3, 1],
    transition: {
      delay: 0.04 + custom * 0.04,
      duration: 0.28,
      times: [0, 0.5, 1],
    },
  }),
};

const RANGE_LINES = [
  { d: "M14.25 12.75h2.25", index: 0 },
  { d: "M7.5 15h4.5", index: 1 },
] as const;

const FIRST_DOT = { d: "M12 12.75h.005v.006H12v-.006Z" };

const DOTS = [
  { d: "M14.25 15h.005v.005h-.005v-.005Z", index: 0 },
  { d: "M16.5 15h.006v.005H16.5v-.005Z", index: 1 },
  { d: "M7.5 17.25h.005v.005h-.006v-.005Z", index: 2 },
  { d: "M9.75 17.25h.005v.006H9.75v-.006Z", index: 3 },
  { d: "M12 17.25h.006v.006h-.006v-.005Z", index: 4 },
  { d: "M14.25 17.25h.006v.006h-.006v-.006Z", index: 5 },
] as const;

const CalendarDateRangeIcon = forwardRef<
  CalendarDateRangeIconHandle,
  CalendarDateRangeIconProps
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
        <path d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
        <motion.path
          animate={controls}
          d={FIRST_DOT.d}
          initial="normal"
          variants={FIRST_DOT_VARIANTS}
        />
        {RANGE_LINES.map((line) => (
          <motion.path
            animate={controls}
            custom={line.index}
            d={line.d}
            initial="normal"
            key={`line-${line.index}`}
            variants={LINE_VARIANTS}
          />
        ))}
        {DOTS.map((dot) => (
          <motion.path
            animate={controls}
            custom={dot.index}
            d={dot.d}
            initial="normal"
            key={`dot-${dot.index}`}
            variants={DOT_VARIANTS}
          />
        ))}
      </svg>
    </div>
  );
});

CalendarDateRangeIcon.displayName = "CalendarDateRangeIcon";

export { CalendarDateRangeIcon };
