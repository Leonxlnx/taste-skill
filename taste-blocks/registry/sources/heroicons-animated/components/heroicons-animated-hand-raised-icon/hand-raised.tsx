"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface HandRaisedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HandRaisedIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const VARIANTS: Variants = {
  normal: {
    rotate: 0,
    originX: "50%",
    originY: "90%",
  },
  animate: {
    rotate: [0, -15, 10, -5, 0],
    originX: "50%",
    originY: "90%",
    transition: {
      duration: 0.28,
      ease: "easeInOut",
    },
  },
};

const HandRaisedIcon = forwardRef<HandRaisedIconHandle, HandRaisedIconProps>(
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
          variants={VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10.05 4.575C10.05 3.70515 9.34486 3 8.47501 3C7.60516 3 6.90001 3.70515 6.90001 4.575L6.9 7.575M10.05 4.575L10.05 3.075C10.05 2.20515 10.7552 1.5 11.625 1.5C12.4949 1.5 13.2 2.20515 13.2 3.075L13.2 4.575M10.05 4.575L10.125 10.5M13.2 11.25V4.575M13.2 4.575C13.2 3.70515 13.9052 3 14.775 3C15.6449 3 16.35 3.70515 16.35 4.575V15M6.9 7.575C6.9 6.70515 6.19485 6 5.325 6C4.45515 6 3.75 6.70515 3.75 7.575V15.75C3.75 19.4779 6.77208 22.5 10.5 22.5H12.5179C13.9103 22.5 15.2456 21.9469 16.2302 20.9623L17.9623 19.2302C18.9469 18.2456 19.5 16.9103 19.5 15.5179L19.5031 13.494C19.5046 13.3209 19.5701 13.1533 19.7007 13.0227C20.3158 12.4076 20.3158 11.4104 19.7007 10.7953C19.0857 10.1802 18.0884 10.1802 17.4733 10.7953C16.7315 11.5371 16.3578 12.5111 16.3531 13.4815M6.9 7.575V12M13.17 16.318C13.5599 15.9281 14.0035 15.6248 14.477 15.4079C15.0701 15.1362 15.71 15.0003 16.35 15M16.3519 15H16.35" />
        </motion.svg>
      </div>
    );
  }
);

HandRaisedIcon.displayName = "HandRaisedIcon";

export { HandRaisedIcon };
