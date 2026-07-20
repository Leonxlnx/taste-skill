"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface LightBulbIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LightBulbIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const BULB_VARIANTS: Variants = {
  normal: {
    fillOpacity: 0,
    fill: "currentColor",
  },
  animate: {
    fillOpacity: [0, 1, 0, 1, 0],
    transition: {
      duration: 0.28,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

const LightBulbIcon = forwardRef<LightBulbIconHandle, LightBulbIconProps>(
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
          <motion.path
            animate={controls}
            d="M14.25 18V17.8083C14.25 16.8254 14.9083 15.985 15.7585 15.4917C17.9955 14.1938 19.5 11.7726 19.5 9C19.5 4.85786 16.1421 1.5 12 1.5C7.85786 1.5 4.5 4.85786 4.5 9C4.5 11.7726 6.00446 14.1938 8.24155 15.4917C9.09173 15.985 9.75 16.8254 9.75 17.8083V18"
            initial="normal"
            variants={BULB_VARIANTS}
          />
          <path d="M12 18V12.75M12 12.75C12.5179 12.75 13.0206 12.6844 13.5 12.561M12 12.75C11.4821 12.75 10.9794 12.6844 10.5 12.561" />
          <path d="M14.25 20.0394C13.5212 20.1777 12.769 20.25 12 20.25C11.231 20.25 10.4788 20.1777 9.75 20.0394" />
          <path d="M13.5 22.422C13.007 22.4736 12.5066 22.5 12 22.5C11.4934 22.5 10.993 22.4736 10.5 22.422" />
        </svg>
      </div>
    );
  }
);

LightBulbIcon.displayName = "LightBulbIcon";

export { LightBulbIcon };
