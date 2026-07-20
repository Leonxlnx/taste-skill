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
export interface PauseIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface PauseIconProps extends Omit<
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

const PauseIcon = forwardRef<PauseIconHandle, PauseIconProps>(
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

  const iconVariants: Variants = {
   normal: {
    scale: 1,
   },
   animate: {
    scale: [1, 0.92, 1],
    transition: {
     duration: 0.25 * duration,
     ease: "easeOut",
    },
   },
  };

  const barLeftVariants: Variants = {
   normal: {
    x: 0,
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    x: [-0.8, 0],
    pathLength: [0.6, 1],
    opacity: [0.6, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
    },
   },
  };

  const barRightVariants: Variants = {
   normal: {
    x: 0,
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    x: [0.8, 0],
    pathLength: [0.6, 1],
    opacity: [0.6, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
     delay: 0.05 * duration,
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
      variants={iconVariants}
     >
      <m.rect
       x="14"
       y="3"
       width="5"
       height="18"
       rx="1"
       variants={barRightVariants}
      />
      <m.rect
       x="5"
       y="3"
       width="5"
       height="18"
       rx="1"
       variants={barLeftVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

PauseIcon.displayName = "PauseIcon";
export { PauseIcon };
