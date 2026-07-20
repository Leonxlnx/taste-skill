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
export interface GitCompareArrowsIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GitCompareArrowsIconProps extends Omit<
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

const GitCompareArrowsIcon = forwardRef<
 GitCompareArrowsIconHandle,
 GitCompareArrowsIconProps
>(
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
    transition: { duration: duration * 0.3, ease },
   },
  };

  const bottomNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: { duration: duration * 0.3, ease, delay: duration * 0.3 },
   },
  };

  const topPath: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.5,
     ease,
     delay: duration * 0.15,
    },
   },
  };

  const bottomPath: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.5,
     ease,
     delay: duration * 0.45,
    },
   },
  };

  const topArrow: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [-4, 0],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.35,
     ease,
     delay: duration * 0.3,
    },
   },
  };

  const bottomArrow: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [4, 0],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.35,
     ease,
     delay: duration * 0.6,
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
       cx="5"
       cy="6"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={topNode}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M12 6h5a2 2 0 0 1 2 2v7"
       variants={topPath}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="m15 9-3-3 3-3"
       variants={topArrow}
       initial="normal"
       animate={controls}
      />

      <m.circle
       cx="19"
       cy="18"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={bottomNode}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M12 18H7a2 2 0 0 1-2-2V9"
       variants={bottomPath}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="m9 15 3 3-3 3"
       variants={bottomArrow}
       initial="normal"
       animate={controls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GitCompareArrowsIcon.displayName = "GitCompareArrowsIcon";

export { GitCompareArrowsIcon };
