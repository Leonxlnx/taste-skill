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
export interface GitBranchIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GitBranchIconProps extends Omit<
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

const GitBranchIcon = forwardRef<GitBranchIconHandle, GitBranchIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.8,
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
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e as any);
   },
   [controls, onMouseLeave],
  );

  const easeSmooth: [number, number, number, number] = [0.25, 1, 0.5, 1];

  const trunkNodeVariants: Variants = {
   normal: {
    scale: 1,
    opacity: 1,
   },
   animate: {
    scale: [1, 1.12, 1],
    opacity: [1, 0.9, 1],
    transition: {
     duration: duration * 0.35,
     ease: easeSmooth,
    },
   },
  };

  const pathVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     pathLength: {
      duration: duration * 0.6,
      ease: easeSmooth,
      delay: duration * 0.15,
     },
     opacity: {
      duration: duration * 0.3,
      ease: "easeOut",
      delay: duration * 0.15,
     },
    },
   },
  };

  const branchNodeVariants: Variants = {
   normal: {
    scale: 1,
    opacity: 1,
   },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.35,
     ease: easeSmooth,
     delay: duration * 0.55,
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
      style={{ overflow: "visible" }}
     >
      <m.circle
       cx="6"
       cy="18"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={trunkNodeVariants}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M15 6a9 9 0 0 0-9 9V3"
       variants={pathVariants}
       initial="normal"
       animate={controls}
      />

      <m.circle
       cx="18"
       cy="6"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={branchNodeVariants}
       initial="normal"
       animate={controls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GitBranchIcon.displayName = "GitBranchIcon";

export { GitBranchIcon };
