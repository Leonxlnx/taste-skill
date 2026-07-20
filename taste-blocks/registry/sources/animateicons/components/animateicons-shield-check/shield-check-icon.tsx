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
export interface ShieldCheckIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ShieldCheckIconProps extends Omit<
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

const ShieldCheckIcon = forwardRef<ShieldCheckIconHandle, ShieldCheckIconProps>(
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
  const shieldControls = useAnimation();
  const checkControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      shieldControls.start("normal");
      checkControls.start("normal");
     } else {
      shieldControls.start("animate");
      checkControls.start("animate");
     }
    },
    stopAnimation: () => {
     shieldControls.start("normal");
     checkControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     shieldControls.start("animate");
     checkControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [shieldControls, checkControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     shieldControls.start("normal");
     checkControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [shieldControls, checkControls, onMouseLeave],
  );

  const shieldVariants: Variants = {
   normal: { strokeDashoffset: 0, scale: 1, rotate: 0 },
   animate: {
    strokeDashoffset: [300, 24, 0],
    scale: [1, 0.98, 1.04, 1],
    rotate: [0, -2, 1, 0],
    transition: {
     duration: 1.0 * duration,
     ease: [0.18, 0.85, 0.25, 1],
     times: [0, 0.35, 0.75, 1],
    },
   },
  };

  const checkVariants: Variants = {
   normal: { strokeDashoffset: 0, scale: 1, opacity: 1 },
   animate: {
    strokeDashoffset: [40, 0],
    scale: [1, 1.1, 0.98, 1],
    opacity: [0, 1, 1],
    transition: {
     duration: 1.3 * duration,
     ease: [0.22, 0.9, 0.28, 1],
     delay: 0.25,
     times: [0, 0.5, 1],
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
      <m.path
       d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
       initial="normal"
       animate={shieldControls}
       variants={shieldVariants}
       style={{ strokeDasharray: 300, transformOrigin: "12px 12px" }}
      />
      <m.path
       d="m9 12 2 2 4-4"
       initial="normal"
       animate={checkControls}
       variants={checkVariants}
       style={{ strokeDasharray: 40, strokeLinecap: "round" }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ShieldCheckIcon.displayName = "ShieldCheckIcon";
export { ShieldCheckIcon };
