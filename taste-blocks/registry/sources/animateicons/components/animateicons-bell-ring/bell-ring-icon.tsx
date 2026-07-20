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
export interface BellRingIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BellRingIconProps extends Omit<
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

const BellRingIcon = forwardRef<BellRingIconHandle, BellRingIconProps>(
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

  const bellVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: [0, 7, -18, 14, -9, 5, -2, 0],
    transition: {
     duration: 1.3 * duration,
     ease: "easeInOut",
     times: [0, 0.09, 0.26, 0.45, 0.62, 0.78, 0.9, 1],
    },
   },
  };

  const clapperVariants: Variants = {
   normal: { x: 0 },
   animate: {
    x: [0, 1.5, -5, 4, -2.5, 1.5, -1, 0],
    transition: {
     duration: 1.3 * duration,
     ease: "easeInOut",
     times: [0, 0.09, 0.26, 0.45, 0.62, 0.78, 0.9, 1],
     delay: 0.08 * duration,
    },
   },
  };

  const waveVariants: Variants = {
   normal: { opacity: 1, scale: 1 },
   animate: {
    opacity: [0, 1, 0.25, 1, 1],
    scale: [0.5, 1.15, 0.7, 1.15, 1],
    transition: {
     duration: 1.3 * duration,
     ease: "easeOut",
     times: [0, 0.25, 0.5, 0.75, 1],
     delay: 0.08 * duration,
    },
   },
  };

  return (
   <LazyMotion features={domMin} strict>
    <m.div
     className={cn("relative inline-flex", className)}
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
      variants={bellVariants}
      style={{ transformOrigin: "top center" }}
     >
      <m.path d="M10.268 21a2 2 0 0 0 3.464 0" variants={clapperVariants} />
      <m.path
       d="M22 8c0-2.3-.8-4.3-2-6"
       variants={waveVariants}
       style={{ transformOrigin: "0% 100%" }}
      />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
      <m.path
       d="M4 2C2.8 3.7 2 5.7 2 8"
       variants={waveVariants}
       style={{ transformOrigin: "100% 100%" }}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BellRingIcon.displayName = "BellRingIcon";
export { BellRingIcon };
