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
export interface MapPinnedIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MapPinnedIconProps extends Omit<
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

const MapPinnedIcon = forwardRef<MapPinnedIconHandle, MapPinnedIconProps>(
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
  const circleControls = useAnimation();
  const trayControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      pinControls.start("normal");
      circleControls.start("normal");
      trayControls.start("normal");
     } else {
      pinControls.start("animate");
      circleControls.start("animate");
      trayControls.start("animate");
     }
    },
    stopAnimation: () => {
     pinControls.start("normal");
     circleControls.start("normal");
     trayControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     pinControls.start("animate");
     circleControls.start("animate");
     trayControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    pinControls,
    circleControls,
    trayControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     pinControls.start("normal");
     circleControls.start("normal");
     trayControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [pinControls, circleControls, trayControls, onMouseLeave],
  );

  const pinVariants: Variants = {
   normal: { strokeDashoffset: 0 },
   animate: {
    strokeDashoffset: [180, 0],
    transition: { duration: 1.6 * duration, ease: "easeOut" },
   },
  };

  const circleVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.18, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 0.9 * duration, ease: "easeOut", delay: 0.8 },
   },
  };

  const trayVariants: Variants = {
   normal: { y: 0, strokeDashoffset: 0, opacity: 1 },
   animate: {
    y: [-4, 0],
    strokeDashoffset: [80, 0],
    opacity: [0, 1],
    transition: { duration: 0.8 * duration, ease: "easeOut", delay: 0.12 },
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
       d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"
       initial="normal"
       animate={pinControls}
       variants={pinVariants}
       style={{ strokeDasharray: 180, strokeLinecap: "round" }}
      />
      <m.circle
       cx="12"
       cy="8"
       r="2"
       initial="normal"
       animate={circleControls}
       variants={circleVariants}
      />
      <m.path
       d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"
       initial="normal"
       animate={trayControls}
       variants={trayVariants}
       style={{ strokeDasharray: 80, strokeLinecap: "round" }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MapPinnedIcon.displayName = "MapPinnedIcon";
export { MapPinnedIcon };
