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
export interface MapPinCheckIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MapPinCheckIconProps extends Omit<
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

const MapPinCheckIcon = forwardRef<MapPinCheckIconHandle, MapPinCheckIconProps>(
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
  const checkControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      pathControls.start("normal");
      circleControls.start("normal");
      checkControls.start("normal");
     } else {
      pathControls.start("animate");
      circleControls.start("animate");
      checkControls.start("animate");
     }
    },
    stopAnimation: () => {
     pathControls.start("normal");
     circleControls.start("normal");
     checkControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     pathControls.start("animate");
     circleControls.start("animate");
     checkControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    pathControls,
    circleControls,
    checkControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     pathControls.start("normal");
     circleControls.start("normal");
     checkControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [pathControls, circleControls, checkControls, onMouseLeave],
  );

  const pathVariants: Variants = {
   normal: { strokeDashoffset: 0 },
   animate: {
    strokeDashoffset: [140, 0],
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

  const checkVariants: Variants = {
   normal: { strokeDashoffset: 0 },
   animate: {
    strokeDashoffset: [30, 0],
    transition: { duration: 1 * duration, ease: "easeOut", delay: 0.4 },
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
       d="M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728"
       initial="normal"
       animate={pathControls}
       variants={pathVariants}
       style={{ strokeDasharray: 140 }}
      />
      <m.circle
       cx="12"
       cy="10"
       r="3"
       initial="normal"
       animate={circleControls}
       variants={circleVariants}
      />
      <m.path
       d="m16 18 2 2 4-4"
       initial="normal"
       animate={checkControls}
       variants={checkVariants}
       style={{ strokeDasharray: 30 }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MapPinCheckIcon.displayName = "MapPinCheckIcon";
export { MapPinCheckIcon };
