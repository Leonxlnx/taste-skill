"use client";

import { cn } from "../../lib/utils";
import type { Variants } from "motion/react";
import {
 LazyMotion,
 domMin,
 m,
 useAnimation,
 useReducedMotion,
} from "motion/react";
import {
 forwardRef,
 useCallback,
 useImperativeHandle,
 useRef,
 type HTMLAttributes,
} from "react";
export interface GitCommitHorizontalIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GitCommitHorizontalIconProps extends Omit<
 HTMLAttributes<HTMLDivElement>,
 | "color"
 | "onDrag"
 | "onDragStart"
 | "onDragEnd"
 | "onAnimationStart"
 | "onAnimationEnd"
 | "onAnimationIteration"
> {
 size?: number;
 duration?: number;
 isAnimated?: boolean;
 color?: string;
}

const GitCommitHorizontalIcon = forwardRef<
 GitCommitHorizontalIconHandle,
 GitCommitHorizontalIconProps
>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.7,
   isAnimated = true,
   color,
   ...props
  },
  ref,
 ) => {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () =>
     !isAnimated || reduced ? controls.start("normal") : controls.start("animate"),
    stopAnimation: () => controls.start("normal"),
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) controls.start("animate");
    else onMouseEnter?.(e as any);
   },
   [controls, reduced, isAnimated, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e);
   },
   [controls, onMouseLeave],
  );

  const overshootEase: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
  const smoothDecel: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const svgVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: 360,
    transition: {
     duration: duration,
     ease: "linear",
    },
   },
  };

  const commitNodeVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.2, 1.24, 0.92, 1],
    opacity: [0, 1],
    transition: {
     scale: {
      duration: 0.52 * duration,
      ease: overshootEase,
      delay: 0,
     },
     opacity: {
      duration: 0.22 * duration,
      ease: "easeOut",
      delay: 0,
     },
    },
   },
  };

  const leftLineVariants: Variants = {
   normal: { x1: 3, opacity: 1 },
   animate: {
    x1: [9, 3],
    opacity: [0, 1],
    transition: {
     x1: {
      duration: 0.42 * duration,
      ease: smoothDecel,
      delay: 0.42 * duration,
     },
     opacity: {
      duration: 0.18 * duration,
      ease: "easeOut",
      delay: 0.42 * duration,
     },
    },
   },
  };

  const rightLineVariants: Variants = {
   normal: { x2: 21, opacity: 1 },
   animate: {
    x2: [15, 21],
    opacity: [0, 1],
    transition: {
     x2: {
      duration: 0.42 * duration,
      ease: smoothDecel,
      delay: 0.42 * duration,
     },
     opacity: {
      duration: 0.18 * duration,
      ease: "easeOut",
      delay: 0.42 * duration,
     },
    },
   },
  };

  return (
   <LazyMotion features={domMin} strict>
    <m.div
     className={cn("inline-flex items-center justify-center", className)}
     onMouseEnter={handleEnter}
     onMouseLeave={handleLeave}
     {...props}
     style={{ color, ...props.style }}
    >
     <m.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={svgVariants}
      initial="normal"
      animate={controls}
     >
      <m.circle
       cx="12"
       cy="12"
       r="3"
       variants={commitNodeVariants}
       initial="normal"
       animate={controls}
      />

      <m.line
       x1="3"
       x2="9"
       y1="12"
       y2="12"
       variants={leftLineVariants}
       initial="normal"
       animate={controls}
      />

      <m.line
       x1="15"
       x2="21"
       y1="12"
       y2="12"
       variants={rightLineVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GitCommitHorizontalIcon.displayName = "GitCommitHorizontalIcon";

export { GitCommitHorizontalIcon };
