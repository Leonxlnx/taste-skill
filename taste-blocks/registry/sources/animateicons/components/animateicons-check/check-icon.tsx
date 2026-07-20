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
export interface CheckIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CheckIconProps extends Omit<
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

const CheckIcon = forwardRef<CheckIconHandle, CheckIconProps>(
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

  // Premium check: the tick draws in fast (expo ease) while the mark pops
  // with a slight overshoot, then settles - a confident "done" gesture.
  const tickVariants: Variants = {
   normal: { strokeDashoffset: 0, scale: 1, opacity: 1 },
   animate: {
    strokeDashoffset: [20, 0],
    scale: [0.7, 1.15, 0.97, 1],
    opacity: [0, 1, 1],
    transition: {
     strokeDashoffset: { duration: 0.45 * duration, ease: [0.16, 1, 0.3, 1] },
     scale: {
      duration: 0.55 * duration,
      ease: "easeOut",
      times: [0, 0.55, 0.8, 1],
      delay: 0.1 * duration,
     },
     opacity: { duration: 0.18 * duration },
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
     >
      <m.path
       d="M5 13l4 4L19 7"
       strokeDasharray="20"
       strokeDashoffset="0"
       variants={tickVariants}
       initial="normal"
       animate={controls}
       style={{ transformOrigin: "center" }}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CheckIcon.displayName = "CheckIcon";
export { CheckIcon };
