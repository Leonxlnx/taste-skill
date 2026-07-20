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
export interface GitCompareIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GitCompareIconProps extends Omit<
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

const GitCompareIcon = forwardRef<GitCompareIconHandle, GitCompareIconProps>(
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
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e);
   },
   [controls, onMouseLeave],
  );

  const ease: [number, number, number, number] = [0.25, 1, 0.5, 1];

  const topNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.3,
     ease,
    },
   },
  };

  const bottomNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.3,
     ease,
     delay: duration * 0.15,
    },
   },
  };

  const pathTop: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.5,
     ease,
     delay: duration * 0.3,
    },
   },
  };

  const pathBottom: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.5,
     ease,
     delay: duration * 0.3,
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
      <m.circle
       cx="6"
       cy="6"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={topNode}
       initial="normal"
       animate={controls}
      />

      <m.circle
       cx="18"
       cy="18"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={bottomNode}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M13 6h3a2 2 0 0 1 2 2v7"
       variants={pathTop}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M11 18H8a2 2 0 0 1-2-2V9"
       variants={pathBottom}
       initial="normal"
       animate={controls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GitCompareIcon.displayName = "GitCompareIcon";

export { GitCompareIcon };
