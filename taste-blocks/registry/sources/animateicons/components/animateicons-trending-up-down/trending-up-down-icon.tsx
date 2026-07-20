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
export interface TrendingUpDownIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface TrendingUpDownIconProps extends Omit<
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

const TrendingUpDownIcon = forwardRef<
 TrendingUpDownIconHandle,
 TrendingUpDownIconProps
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

  const iconVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.05, 0.98, 1],
    rotate: [0, 2, -2, 0],
    transition: {
     duration: 0.9 * duration,
     ease: [0.22, 1, 0.36, 1],
    },
   },
  };

  const upPathVariants: Variants = {
   normal: { pathLength: 1, pathOffset: 0 },
   animate: {
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
    },
   },
  };

  const downPathVariants: Variants = {
   normal: { opacity: 1, x: 0, y: 0 },
   animate: {
    opacity: [0, 1],
    x: [4, 0],
    y: [-4, 0],
    transition: {
     duration: 0.55 * duration,
     ease: [0.16, 1, 0.3, 1],
     delay: 0.15,
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
      initial="normal"
      animate={controls}
      variants={iconVariants}
     >
      <m.path
       d="M14.828 14.828 21 21"
       variants={downPathVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M21 16v5h-5"
       variants={downPathVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="m21 3-9 9-4-4-6 6"
       variants={upPathVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M21 8V3h-5"
       variants={upPathVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

TrendingUpDownIcon.displayName = "TrendingUpDownIcon";
export { TrendingUpDownIcon };
