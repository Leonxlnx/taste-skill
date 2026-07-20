"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface ArrowsPointingInIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowsPointingInIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const TOP_LEFT_ARROW_VARIANTS: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, 2, 0],
    translateY: [0, 2, 0],
    transition: {
      duration: 0.28,
      times: [0, 0.4, 1],
    },
  },
};

const BOTTOM_LEFT_ARROW_VARIANTS: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, 2, 0],
    translateY: [0, -2, 0],
    transition: {
      duration: 0.28,
      times: [0, 0.4, 1],
    },
  },
};

const TOP_RIGHT_ARROW_VARIANTS: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, -2, 0],
    translateY: [0, 2, 0],
    transition: {
      duration: 0.28,
      times: [0, 0.4, 1],
    },
  },
};

const BOTTOM_RIGHT_ARROW_VARIANTS: Variants = {
  normal: { translateX: 0, translateY: 0 },
  animate: {
    translateX: [0, -2, 0],
    translateY: [0, -2, 0],
    transition: {
      duration: 0.28,
      times: [0, 0.4, 1],
    },
  },
};

const ArrowsPointingInIcon = forwardRef<
  ArrowsPointingInIconHandle,
  ArrowsPointingInIconProps
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
        <motion.g animate={controls} variants={TOP_LEFT_ARROW_VARIANTS}>
          <path d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75" />
        </motion.g>
        <motion.g animate={controls} variants={BOTTOM_LEFT_ARROW_VARIANTS}>
          <path d="M9 15v4.5M9 15H4.5M9 15l-5.25 5.25" />
        </motion.g>
        <motion.g animate={controls} variants={TOP_RIGHT_ARROW_VARIANTS}>
          <path d="M15 9h4.5M15 9V4.5M15 9l5.25-5.25" />
        </motion.g>
        <motion.g animate={controls} variants={BOTTOM_RIGHT_ARROW_VARIANTS}>
          <path d="M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
        </motion.g>
      </svg>
    </div>
  );
});

ArrowsPointingInIcon.displayName = "ArrowsPointingInIcon";

export { ArrowsPointingInIcon };
