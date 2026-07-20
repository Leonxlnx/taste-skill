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
export interface CheckCheckIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CheckCheckIconProps extends Omit<
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

const CheckCheckIcon = forwardRef<CheckCheckIconHandle, CheckCheckIconProps>(
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

  const tick1Variants: Variants = {
   normal: { strokeDashoffset: 0, scale: 1, opacity: 1 },
   animate: {
    strokeDashoffset: [20, 0],
    scale: [1, 1.2, 1],
    opacity: [0.5, 1],
    transition: { duration: 0.7 * duration, ease: "easeInOut" },
   },
  };

  const tick2Variants: Variants = {
   normal: { opacity: 1, x: 0 },
   animate: {
    opacity: [0, 1],
    x: [-6, 0],
    transition: { duration: 0.5 * duration, ease: "easeOut", delay: 0.35 },
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
     >
      <m.path
       d="M18 6 7 17l-5-5"
       strokeDasharray="20"
       strokeDashoffset="0"
       variants={tick1Variants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="m22 10-7.5 7.5L13 16"
       strokeDasharray="20"
       strokeDashoffset="0"
       variants={tick2Variants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CheckCheckIcon.displayName = "CheckCheckIcon";
export { CheckCheckIcon };
