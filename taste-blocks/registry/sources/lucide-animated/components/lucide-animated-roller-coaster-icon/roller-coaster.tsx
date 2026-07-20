"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../lib/utils";

export interface RollerCoasterIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface RollerCoasterIconProps extends HTMLAttributes<HTMLDivElement> {
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

const RollerCoasterIcon = forwardRef<
  RollerCoasterIconHandle,
  RollerCoasterIconProps
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
        <motion.path animate={controls} d="M6 19V5" variants={VARIANTS} />
        <motion.path animate={controls} d="M10 19V6.8" variants={VARIANTS} />
        <motion.path animate={controls} d="M14 19v-7.8" variants={VARIANTS} />
        <motion.path animate={controls} d="M18 5v4" variants={VARIANTS} />
        <motion.path animate={controls} d="M18 19v-6" variants={VARIANTS} />
        <motion.path animate={controls} d="M22 19V9" variants={VARIANTS} />
        <motion.path
          animate={controls}
          custom={2}
          d="M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65"
          variants={VARIANTS}
        />
      </svg>
    </div>
  );
});

RollerCoasterIcon.displayName = "RollerCoasterIcon";

export { RollerCoasterIcon };
