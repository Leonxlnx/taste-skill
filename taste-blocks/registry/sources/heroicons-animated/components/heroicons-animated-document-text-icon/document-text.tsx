"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface DocumentTextIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DocumentTextIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const LINE_VARIANTS: Variants = {
  visible: { pathLength: 1, opacity: 1 },
  hidden: { pathLength: 0, opacity: 0 },
};

const DocumentTextIcon = forwardRef<
  DocumentTextIconHandle,
  DocumentTextIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 28, isAnimated = true, ...props }, ref) => {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: async () => {
        await controls.start((i) => ({
          pathLength: 0,
          opacity: 0,
          transition: { delay: i * 0.04, duration: 0.28 },
        }));
        await controls.start((i) => ({
          pathLength: 1,
          opacity: 1,
          transition: { delay: i * 0.04, duration: 0.28 },
        }));
      },
      stopAnimation: () => controls.start("visible"),
    };
  });

  const handleMouseEnter = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAnimated || reduced) return;
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        await controls.start((i) => ({
          pathLength: 0,
          opacity: 0,
          transition: { delay: i * 0.04, duration: 0.28 },
        }));
        await controls.start((i) => ({
          pathLength: 1,
          opacity: 1,
          transition: { delay: i * 0.04, duration: 0.28 },
        }));
      }
    },
    [controls, isAnimated, onMouseEnter, reduced]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start("visible");
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
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        {[
          { d: "M8.25 12.75h7.5", index: 0 },
          { d: "M8.25 15.75H12", index: 1 },
        ].map((line) => (
          <motion.path
            animate={controls}
            custom={line.index}
            d={line.d}
            initial="visible"
            key={line.index}
            variants={LINE_VARIANTS}
          />
        ))}
      </svg>
    </div>
  );
});

DocumentTextIcon.displayName = "DocumentTextIcon";

export { DocumentTextIcon };
