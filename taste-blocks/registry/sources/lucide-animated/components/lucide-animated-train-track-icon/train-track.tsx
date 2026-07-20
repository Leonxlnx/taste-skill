"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../lib/utils";

export interface TrainTrackIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TrainTrackIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const TRANSITION: Transition = {
  duration: 0.28,
  opacity: { delay: 0.08 },
};

const VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: (custom: number) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      ...TRANSITION,
      delay: 0.04 * custom,
    },
  }),
};

const TrainTrackIcon = forwardRef<TrainTrackIconHandle, TrainTrackIconProps>(
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
          <path d="M2 17 17 2" />
          <motion.path
            animate={controls}
            custom={4}
            d="m2 14 8 8"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={3}
            d="m5 11 8 8"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={2}
            d="m8 8 8 8"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={1}
            d="m11 5 8 8"
            variants={VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={0}
            d="m14 2 8 8"
            variants={VARIANTS}
          />
          <path d="M7 22 22 7" />
        </svg>
      </div>
    );
  }
);

TrainTrackIcon.displayName = "TrainTrackIcon";

export { TrainTrackIcon };
