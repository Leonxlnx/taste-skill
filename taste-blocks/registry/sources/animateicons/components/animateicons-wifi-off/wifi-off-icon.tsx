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
export interface WifiOffIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface WifiOffIconProps extends Omit<
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

const WifiOffIcon = forwardRef<WifiOffIconHandle, WifiOffIconProps>(
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
  const dotControls = useAnimation();
  const slashControls = useAnimation();
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
      dotControls.start("normal");
      slashControls.start("normal");
     } else {
      groupControls.start("animate");
      arcLargeControls.start("animate");
      arcMidControls.start("animate");
      arcSmallControls.start("animate");
      dotControls.start("animate");
      slashControls.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     arcLargeControls.start("normal");
     arcMidControls.start("normal");
     arcSmallControls.start("normal");
     dotControls.start("normal");
     slashControls.start("normal");
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
     dotControls.start("animate");
     slashControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    arcLargeControls,
    arcMidControls,
    arcSmallControls,
    dotControls,
    slashControls,
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
     dotControls.start("normal");
     slashControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [
    groupControls,
    arcLargeControls,
    arcMidControls,
    arcSmallControls,
    dotControls,
    slashControls,
    onMouseLeave,
   ],
  );

  const groupVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.04, 0.98, 1],
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

  const dotVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.6, 1.15, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.6 * duration, ease: "easeOut", delay: 0.22 },
   },
  };

  const slashVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
     duration: 0.5 * duration,
     ease: "easeInOut",
     delay: 0.02,
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="normal"
      animate={groupControls}
      variants={groupVariants}
     >
      <m.path
       d="M12 20h.01"
       initial="normal"
       animate={dotControls}
       variants={dotVariants}
      />
      <m.path
       d="M8.5 16.429a5 5 0 0 1 7 0"
       initial="normal"
       animate={arcSmallControls}
       variants={arcSmallVariants}
      />
      <m.path
       d="M5 12.859a10 10 0 0 1 5.17-2.69"
       initial="normal"
       animate={arcMidControls}
       variants={arcMidVariants}
      />
      <m.path
       d="M19 12.859a10 10 0 0 0-2.007-1.523"
       initial="normal"
       animate={arcMidControls}
       variants={arcMidVariants}
      />
      <m.path
       d="M2 8.82a15 15 0 0 1 4.177-2.643"
       initial="normal"
       animate={arcLargeControls}
       variants={arcLargeVariants}
      />
      <m.path
       d="M22 8.82a15 15 0 0 0-11.288-3.764"
       initial="normal"
       animate={arcLargeControls}
       variants={arcLargeVariants}
      />
      <m.path
       d="m2 2 20 20"
       initial="normal"
       animate={slashControls}
       variants={slashVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

WifiOffIcon.displayName = "WifiOffIcon";
export { WifiOffIcon };
