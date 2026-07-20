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
export interface MapPinIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MapPinIconProps extends Omit<
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

const MapPinIcon = forwardRef<MapPinIconHandle, MapPinIconProps>(
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
  const pathControls = useAnimation();
  const circleControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      pathControls.start("normal");
      circleControls.start("normal");
     } else {
      pathControls.start("animate");
      circleControls.start("animate");
     }
    },
    stopAnimation: () => {
     pathControls.start("normal");
     circleControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     pathControls.start("animate");
     circleControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [pathControls, circleControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     pathControls.start("normal");
     circleControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [pathControls, circleControls, onMouseLeave],
  );

  const pathVariants: Variants = {
   normal: { strokeDashoffset: 0, scale: 1 },
   animate: {
    strokeDashoffset: [120, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 1.5 * duration, ease: "easeOut" },
   },
  };

  const circleVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 0.9 * duration, ease: "easeOut", delay: 0.2 },
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
       animate={pathControls}
       variants={pathVariants}
       style={{ strokeDasharray: 120, strokeLinecap: "round" }}
      />
      <m.circle
       cx="12"
       cy="10"
       r="3"
       initial="normal"
       animate={circleControls}
       variants={circleVariants}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MapPinIcon.displayName = "MapPinIcon";
export { MapPinIcon };
