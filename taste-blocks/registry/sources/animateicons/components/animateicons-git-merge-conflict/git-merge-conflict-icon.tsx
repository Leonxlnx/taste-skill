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
export interface GitMergeConflictIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GitMergeConflictIconProps extends Omit<
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

const GitMergeConflictIcon = forwardRef<
 GitMergeConflictIconHandle,
 GitMergeConflictIconProps
>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.85,
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

  const ease: [number, number, number, number] = [0.25, 1, 0.5, 1];

  const cross1: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.3,
     ease,
    },
   },
  };

  const cross2: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.3,
     ease,
     delay: duration * 0.1,
    },
   },
  };

  const vertical: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.4,
     ease,
     delay: duration * 0.25,
    },
   },
  };

  const mergePath: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.45,
     ease,
     delay: duration * 0.45,
    },
   },
  };

  const resultNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.6, 1.15, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.35,
     ease,
     delay: duration * 0.75,
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
     <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
     >
      <m.path
       d="M9 3 3 9"
       variants={cross1}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M9 9 3 3"
       variants={cross2}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M6 12v9"
       variants={vertical}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M12 6h4a2 2 0 0 1 2 2v7"
       variants={mergePath}
       initial="normal"
       animate={controls}
      />

      <m.circle
       cx="18"
       cy="18"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={resultNode}
       initial="normal"
       animate={controls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GitMergeConflictIcon.displayName = "GitMergeConflictIcon";

export { GitMergeConflictIcon };
