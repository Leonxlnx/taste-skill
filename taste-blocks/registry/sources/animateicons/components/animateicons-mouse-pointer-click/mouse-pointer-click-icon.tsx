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
export interface MousePointerClickIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MousePointerClickIconProps extends Omit<
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

const MousePointerClickIcon = forwardRef<
 MousePointerClickIconHandle,
 MousePointerClickIconProps
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

  const pointerVariants: Variants = {
   normal: {
    scale: 1,
    y: 0,
   },
   animate: {
    scale: [1, 0.95, 1],
    y: [0, 1, 0],
    transition: {
     duration: 0.5 * duration,
     ease: "easeInOut",
    },
   },
  };

  const clickRayVariants: Variants = {
   normal: {
    opacity: 1,
    scale: 1,
   },
   animate: {
    opacity: [0, 1, 0, 1],
    scale: [0.6, 1.2, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeOut",
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
      initial="normal"
      animate={controls}
     >
      <m.path d="M14 4.1 12 6" variants={clickRayVariants} />
      <m.path d="m5.1 8-2.9-.8" variants={clickRayVariants} />
      <m.path d="m6 12-1.9 2" variants={clickRayVariants} />
      <m.path d="M7.2 2.2 8 5.1" variants={clickRayVariants} />
      <m.path
       d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"
       variants={pointerVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MousePointerClickIcon.displayName = "MousePointerClickIcon";
export { MousePointerClickIcon };
