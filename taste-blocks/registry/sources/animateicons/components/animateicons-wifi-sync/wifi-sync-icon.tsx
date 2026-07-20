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
export interface WifiSyncIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface WifiSyncIconProps extends Omit<
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

const WifiSyncIcon = forwardRef<WifiSyncIconHandle, WifiSyncIconProps>(
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
  const groupControls = useAnimation();
  const arcLargeControls = useAnimation();
  const arcMidControls = useAnimation();
  const arcSmallControls = useAnimation();
  const syncArrowControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      groupControls.start("normal");
      arcLargeControls.start("normal");
      arcMidControls.start("normal");
      arcSmallControls.start("normal");
      syncArrowControls.start("normal");
     } else {
      groupControls.start("animate");
      arcLargeControls.start("animate");
      arcMidControls.start("animate");
      arcSmallControls.start("animate");
      syncArrowControls.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     arcLargeControls.start("normal");
     arcMidControls.start("normal");
     arcSmallControls.start("normal");
     syncArrowControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     groupControls.start("animate");
     arcLargeControls.start("animate");
     arcMidControls.start("animate");
     arcSmallControls.start("animate");
     syncArrowControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    arcLargeControls,
    arcMidControls,
    arcSmallControls,
    syncArrowControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     groupControls.start("normal");
     arcLargeControls.start("normal");
     arcMidControls.start("normal");
     arcSmallControls.start("normal");
     syncArrowControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [
    groupControls,
    arcLargeControls,
    arcMidControls,
    arcSmallControls,
    syncArrowControls,
    onMouseLeave,
   ],
  );

  const groupVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.05, 0.98, 1],
    rotate: [0, -1.5, 1.5, 0],
    transition: { duration: 0.9 * duration, ease: [0.22, 0.9, 0.32, 1] },
   },
  };

  const arcLargeVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.2, 1],
    transition: { duration: 0.9 * duration, ease: "easeOut", delay: 0.05 },
   },
  };

  const arcMidVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.2, 1],
    transition: { duration: 0.8 * duration, ease: "easeOut", delay: 0.12 },
   },
  };

  const arcSmallVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.2, 1],
    transition: { duration: 0.7 * duration, ease: "easeOut", delay: 0.18 },
   },
  };

  const syncArrowVariants: Variants = {
   normal: { rotate: 0, opacity: 1 },
   animate: {
    rotate: [0, 360],
    opacity: [0.6, 1, 1],
    transition: { duration: 1.4 * duration, ease: "easeInOut", repeat: 0 },
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="normal"
      animate={groupControls}
      variants={groupVariants}
     >
      <m.path
       d="M2 8.82a15 15 0 0 1 20 0"
       initial="normal"
       animate={arcLargeControls}
       variants={arcLargeVariants}
      />
      <m.path
       d="M5 12.86a10 10 0 0 1 3-2.032"
       initial="normal"
       animate={arcMidControls}
       variants={arcMidVariants}
      />
      <m.path
       d="M8.5 16.429h.01"
       initial="normal"
       animate={arcSmallControls}
       variants={arcSmallVariants}
      />
      <m.g
       initial="normal"
       animate={syncArrowControls}
       variants={syncArrowVariants}
      >
       <m.path d="M11.965 10.105v4L13.5 12.5a5 5 0 0 1 8 1.5" />
       <m.path d="M11.965 14.105h4" />
       <m.path d="M17.965 18.105h4L20.43 19.71a5 5 0 0 1-8-1.5" />
       <m.path d="M21.965 22.105v-4" />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

WifiSyncIcon.displayName = "WifiSyncIcon";
export { WifiSyncIcon };
