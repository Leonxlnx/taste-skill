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
export interface MapPinCheckInsideIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MapPinCheckInsideIconProps extends Omit<
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

const MapPinCheckInsideIcon = forwardRef<
 MapPinCheckInsideIconHandle,
 MapPinCheckInsideIconProps
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
  const pinControls = useAnimation();
  const checkControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      pinControls.start("normal");
      checkControls.start("normal");
     } else {
      pinControls.start("animate");
      checkControls.start("animate");
     }
    },
    stopAnimation: () => {
     pinControls.start("normal");
     checkControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     pinControls.start("animate");
     checkControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [pinControls, checkControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     pinControls.start("normal");
     checkControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [pinControls, checkControls, onMouseLeave],
  );

  const pinVariants: Variants = {
   normal: { strokeDashoffset: 0 },
   animate: {
    strokeDashoffset: [160, 0],
    transition: { duration: 1 * duration, ease: "easeInOut" },
   },
  };

  const checkVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [28, 0],
    opacity: [0, 1],
    transition: { duration: 1 * duration, ease: "easeOut", delay: 0.28 },
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
       d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
       initial="normal"
       animate={pinControls}
       variants={pinVariants}
       style={{ strokeDasharray: 160, strokeLinecap: "round" }}
      />
      <m.path
       d="m9 10 2 2 4-4"
       initial="normal"
       animate={checkControls}
       variants={checkVariants}
       style={{ strokeDasharray: 28, strokeLinecap: "round" }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MapPinCheckInsideIcon.displayName = "MapPinCheckInsideIcon";
export { MapPinCheckInsideIcon };
