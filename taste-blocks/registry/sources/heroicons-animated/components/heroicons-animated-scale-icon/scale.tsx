"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface ScaleIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ScaleIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const BALANCE_VARIANTS: Variants = {
  normal: {
    rotate: 0,
  },
  animate: {
    rotate: [0, 8, -8, 4, -4, 0],
    transition: {
      duration: 0.28,
      ease: "easeInOut",
    },
  },
};

const ScaleIcon = forwardRef<ScaleIconHandle, ScaleIconProps>(
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
          <path d="M12 3V20.25M12 20.25C10.528 20.25 9.1179 20.515 7.81483 21M12 20.25C13.472 20.25 14.8821 20.515 16.1852 21" />
          <motion.g
            animate={controls}
            initial="normal"
            style={{ originX: "12px", originY: "4.5px" }}
            variants={BALANCE_VARIANTS}
          >
            <path d="M18.75 4.97089C16.5446 4.66051 14.291 4.5 12 4.5C9.70897 4.5 7.45542 4.66051 5.25 4.97089M18.75 4.97089C19.7604 5.1131 20.7608 5.28677 21.75 5.49087M2.25 5.49087C3.23922 5.28677 4.23956 5.1131 5.25 4.97089" />
            <path d="M18.75 4.97089L21.3704 15.6961C21.4922 16.1948 21.2642 16.7237 20.7811 16.8975C20.1468 17.1257 19.4629 17.25 18.75 17.25C18.0371 17.25 17.3532 17.1257 16.7189 16.8975C16.2358 16.7237 16.0078 16.1948 16.1296 15.6961L18.75 4.97089Z" />
            <path d="M5.25 4.97089L7.87036 15.6961C7.9922 16.1948 7.76419 16.7237 7.28114 16.8975C6.6468 17.1257 5.96292 17.25 5.25 17.25C4.53708 17.25 3.8532 17.1257 3.21886 16.8975C2.73581 16.7237 2.5078 16.1948 2.62964 15.6961L5.25 4.97089Z" />
          </motion.g>
        </svg>
      </div>
    );
  }
);

ScaleIcon.displayName = "ScaleIcon";

export { ScaleIcon };
