"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface PaintBrushIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PaintBrushIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const VARIANTS: Variants = {
  normal: {
    rotate: 0,
    transition: { duration: 0.28, ease: "easeInOut" },
  },
  animate: {
    rotate: [0, -6, 6, 0],
    transformOrigin: "top right",
    transition: { duration: 0.28, ease: "easeInOut" },
  },
};

const PaintBrushIcon = forwardRef<PaintBrushIconHandle, PaintBrushIconProps>(
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
          <path d="M9.53086 16.1224C9.08517 15.0243 8.00801 14.25 6.75 14.25C5.09315 14.25 3.75 15.5931 3.75 17.25C3.75 18.4926 2.74262 19.5 1.49998 19.5C1.44928 19.5 1.39898 19.4983 1.34912 19.495C2.12648 20.8428 3.58229 21.75 5.24998 21.75C7.72821 21.75 9.73854 19.7467 9.74993 17.2711C9.74998 17.2641 9.75 17.2571 9.75 17.25C9.75 16.8512 9.67217 16.4705 9.53086 16.1224ZM9.53086 16.1224C10.7252 15.7153 11.8612 15.1705 12.9175 14.5028M7.875 14.4769C8.2823 13.2797 8.8281 12.1411 9.49724 11.0825M12.9175 14.5028C14.798 13.3141 16.4259 11.7362 17.6806 9.85406L21.5566 4.04006C21.6827 3.85093 21.75 3.6287 21.75 3.40139C21.75 2.76549 21.2345 2.25 20.5986 2.25C20.3713 2.25 20.1491 2.31729 19.9599 2.44338L14.1459 6.31937C12.2638 7.57413 10.6859 9.20204 9.49724 11.0825M12.9175 14.5028C12.2396 12.9833 11.0167 11.7604 9.49724 11.0825" />
        </motion.svg>
      </div>
    );
  }
);

PaintBrushIcon.displayName = "PaintBrushIcon";

export { PaintBrushIcon };
