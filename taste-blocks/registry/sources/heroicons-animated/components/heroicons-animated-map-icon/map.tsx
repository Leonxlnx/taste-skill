"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface MapIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MapIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const MAP_VARIANTS: Variants = {
  normal: {
    rotateX: 0,
  },
  animate: {
    rotateX: [0, 15, 0],
    transition: {
      duration: 0.28,
      ease: "easeInOut",
    },
  },
};

const MapIcon = forwardRef<MapIconHandle, MapIconProps>(
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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          style={{ originX: "50%", originY: "100%" }}
          variants={MAP_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 6.75002V15M15 9.00002V17.25M15.5031 20.7485L20.3781 18.311C20.7592 18.1204 21 17.7309 21 17.3047V4.82031C21 3.98401 20.1199 3.44007 19.3719 3.81408L15.5031 5.74847C15.1864 5.90683 14.8136 5.90683 14.4969 5.74847L9.50312 3.25158C9.1864 3.09322 8.8136 3.09322 8.49688 3.25158L3.62188 5.68908C3.24075 5.87965 3 6.26919 3 6.69531V19.1797C3 20.016 3.8801 20.56 4.62811 20.186L8.49688 18.2516C8.8136 18.0932 9.1864 18.0932 9.50312 18.2516L14.4969 20.7485C14.8136 20.9068 15.1864 20.9068 15.5031 20.7485Z" />
        </motion.svg>
      </div>
    );
  }
);

MapIcon.displayName = "MapIcon";

export { MapIcon };
