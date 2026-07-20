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
export interface ChartScatterIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ChartScatterIconProps extends Omit<
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

const ChartScatterIcon = forwardRef<
 ChartScatterIconHandle,
 ChartScatterIconProps
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
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.04, 1],
    transition: {
     duration: 0.6 * duration,
     ease: [0.22, 1, 0.36, 1],
    },
   },
  };

  const dotVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
    },
   },
  };

  const axisVariants: Variants = {
   normal: { pathLength: 1 },
   animate: {
    pathLength: [0, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     delay: 0.1,
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
      <m.circle
       cx="7.5"
       cy="7.5"
       r=".5"
       fill="currentColor"
       variants={dotVariants}
      />
      <m.circle
       cx="18.5"
       cy="5.5"
       r=".5"
       fill="currentColor"
       variants={dotVariants}
      />
      <m.circle
       cx="11.5"
       cy="11.5"
       r=".5"
       fill="currentColor"
       variants={dotVariants}
      />
      <m.circle
       cx="7.5"
       cy="16.5"
       r=".5"
       fill="currentColor"
       variants={dotVariants}
      />
      <m.circle
       cx="17.5"
       cy="14.5"
       r=".5"
       fill="currentColor"
       variants={dotVariants}
      />
      <m.path d="M3 3v16a2 2 0 0 0 2 2h16" variants={axisVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ChartScatterIcon.displayName = "ChartScatterIcon";
export { ChartScatterIcon };
