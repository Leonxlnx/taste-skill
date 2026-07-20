"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../lib/utils";

export interface WaypointsIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface WaypointsIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: (custom: number) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      delay: 0.04 * custom,
      opacity: { delay: 0.04 * custom },
    },
  }),
};

const WaypointsIcon = forwardRef<WaypointsIconHandle, WaypointsIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, isAnimated = true, ...props }, ref) => {
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
          <motion.circle
            animate={controls}
            custom={0}
            cx="12"
            cy="4.5"
            r="2.5"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={1}
            d="m10.2 6.3-3.9 3.9"
            variants={VARIANTS}
          />
          <motion.circle
            animate={controls}
            custom={0}
            cx="4.5"
            cy="12"
            r="2.5"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={2}
            d="M7 12h10"
            variants={VARIANTS}
          />
          <motion.circle
            animate={controls}
            custom={0}
            cx="19.5"
            cy="12"
            r="2.5"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={3}
            d="m13.8 17.7 3.9-3.9"
            variants={VARIANTS}
          />
          <motion.circle
            animate={controls}
            custom={0}
            cx="12"
            cy="19.5"
            r="2.5"
            variants={VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

WaypointsIcon.displayName = "WaypointsIcon";

export { WaypointsIcon };
