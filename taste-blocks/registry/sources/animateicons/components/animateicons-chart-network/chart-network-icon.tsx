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
export interface ChartNetworkIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ChartNetworkIconProps extends Omit<
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

const ChartNetworkIcon = forwardRef<
 ChartNetworkIconHandle,
 ChartNetworkIconProps
>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 1,
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

  const pathVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.2 * duration },
   },
   animate: {
    pathLength: [0, 1],
    opacity: [0.7, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
    },
   },
  };

  const circleVariants: Variants = {
   normal: {
    scale: 1,
    opacity: 0.7,
    transition: { duration: 0.2 * duration },
   },
   animate: {
    scale: [0, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
    },
   },
  };

  const chartVariants: Variants = {
   normal: {
    scale: 1,
    transition: { duration: 0.2 * duration },
   },
   animate: {
    scale: [1, 1.05, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeInOut",
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
      variants={chartVariants}
      animate={controls}
      initial="normal"
     >
      <m.path d="m13.11 7.664 1.78 2.672" variants={pathVariants} />
      <m.path d="m14.162 12.788-3.324 1.424" variants={pathVariants} />
      <m.path d="m20 4-6.06 1.515" variants={pathVariants} />
      <m.path d="M3 3v16a2 2 0 0 0 2 2h16" variants={pathVariants} />
      <m.circle cx="12" cy="6" r="2" variants={circleVariants} />
      <m.circle cx="16" cy="12" r="2" variants={circleVariants} />
      <m.circle cx="9" cy="15" r="2" variants={circleVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ChartNetworkIcon.displayName = "ChartNetworkIcon";
export { ChartNetworkIcon };
