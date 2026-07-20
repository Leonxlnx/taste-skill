"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../lib/utils";

export interface NfcIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface NfcIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.28,
    },
  },
  fadeOut: {
    opacity: 0,
    transition: { duration: 0.28 },
  },
  fadeIn: (i: number) => ({
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: "easeInOut",
      delay: i * 0.04,
    },
  }),
};

const NfcIcon = forwardRef<NfcIconHandle, NfcIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, isAnimated = true, ...props }, ref) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: async () => {
          if (!isAnimated || reduced) {
            controls.start("normal");
            return;
          }
          await controls.start("fadeOut");
          controls.start("fadeIn");
        },
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) {
          controls.start("normal");
          onMouseEnter?.(e);
          return;
        }
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          await controls.start("fadeOut");
          controls.start("fadeIn");
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
          <motion.path
            animate={controls}
            custom={0}
            d="M6 8.32a7.43 7.43 0 0 1 0 7.36"
            initial={{ opacity: 1 }}
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={1}
            d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"
            initial={{ opacity: 1 }}
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={2}
            d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"
            initial={{ opacity: 1 }}
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={3}
            d="M16.37 2a20.16 20.16 0 0 1 0 20"
            initial={{ opacity: 1 }}
            variants={PATH_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

NfcIcon.displayName = "NfcIcon";

export { NfcIcon };
