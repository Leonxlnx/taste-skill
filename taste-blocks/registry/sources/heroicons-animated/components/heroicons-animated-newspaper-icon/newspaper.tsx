"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface NewspaperIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface NewspaperIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const SQUARE_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [0, 1],
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

const CREATE_LINE_VARIANTS = (delay: number): Variants => ({
  normal: { pathLength: 1, opacity: 1 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.2,
      delay,
      ease: "easeOut",
      opacity: { duration: 0.1, delay },
    },
  },
});

const NewspaperIcon = forwardRef<NewspaperIconHandle, NewspaperIconProps>(
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
          <path d="M16.5 7.5h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
          <motion.path
            animate={controls}
            d="M6 7.5h3v3H6v-3Z"
            initial="normal"
            variants={SQUARE_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 7.5h1.5"
            initial="normal"
            variants={CREATE_LINE_VARIANTS(0.032)}
          />
          <motion.path
            animate={controls}
            d="M12 10.5h1.5"
            initial="normal"
            variants={CREATE_LINE_VARIANTS(0.048)}
          />
          <motion.path
            animate={controls}
            d="M6 13.5h7.5"
            initial="normal"
            variants={CREATE_LINE_VARIANTS(0.064)}
          />
          <motion.path
            animate={controls}
            d="M6 16.5h7.5"
            initial="normal"
            variants={CREATE_LINE_VARIANTS(0.08)}
          />
        </svg>
      </div>
    );
  }
);

NewspaperIcon.displayName = "NewspaperIcon";

export { NewspaperIcon };
