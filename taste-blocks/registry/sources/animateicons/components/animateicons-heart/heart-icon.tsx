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
export interface HeartIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface HeartIconProps extends Omit<
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

const HeartIcon = forwardRef<HeartIconHandle, HeartIconProps>(
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
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [controls, onMouseLeave],
  );

  const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

  // Snappy outline draw, right side following the left.
  const drawVariantLeft: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.45 * duration, ease: easeOut },
   },
  };

  const drawVariantRight: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
     duration: 0.45 * duration,
     ease: easeOut,
     delay: 0.1 * duration,
    },
   },
  };

  // Premium beat: a real lub-dub (two beats) with overshoot, not a single
  // flat pulse.
  const svgVariant: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.25, 0.95, 1.12, 1],
    transition: {
     duration: 0.95 * duration,
     ease: "easeOut",
     times: [0, 0.28, 0.48, 0.72, 1],
     delay: 0.1 * duration,
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
      animate={controls}
      initial="normal"
      variants={svgVariant}
      style={{ transformOrigin: "center" }}
     >
      <m.path
       d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676"
       variants={drawVariantLeft}
       strokeLinecap="round"
       strokeLinejoin="round"
      />
      <m.path
       d="M12.409 5.824A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
       variants={drawVariantRight}
       strokeLinecap="round"
       strokeLinejoin="round"
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

HeartIcon.displayName = "HeartIcon";
export { HeartIcon };
