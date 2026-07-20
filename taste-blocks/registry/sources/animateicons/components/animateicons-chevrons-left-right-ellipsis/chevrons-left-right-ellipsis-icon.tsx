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
export interface ChevronsLeftRightEllipsisIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ChevronsLeftRightEllipsisIconProps extends Omit<
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

const ChevronsLeftRightEllipsisIcon = forwardRef<
 ChevronsLeftRightEllipsisIconHandle,
 ChevronsLeftRightEllipsisIconProps
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
     onMouseLeave?.(e);
    }
   },
   [controls, onMouseLeave],
  );

  const leftArrow: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [0, -4, 0],
    opacity: [1, 0.5, 1],
    transition: { duration: 1 * duration, repeat: 0 },
   },
  };

  const rightArrow: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [0, 4, 0],
    opacity: [1, 0.5, 1],
    transition: { duration: 1 * duration, repeat: 0, delay: 0.2 },
   },
  };

  const dot: Variants = {
   normal: { opacity: 0.3 },
   animate: (i: number) => ({
    opacity: [0.3, 1, 0.3],
    transition: {
     duration: 1 * duration,
     repeat: Infinity,
     delay: i * 0.3,
    },
   }),
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
     >
      <m.path d="M8 12h.01" variants={dot} custom={0} />
      <m.path d="M12 12h.01" variants={dot} custom={1} />
      <m.path d="M16 12h.01" variants={dot} custom={2} />
      <m.path d="m7 7-5 5 5 5" variants={leftArrow} stroke="currentColor" />
      <m.path d="m17 7 5 5-5 5" variants={rightArrow} stroke="currentColor" />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ChevronsLeftRightEllipsisIcon.displayName = "ChevronsLeftRightEllipsisIcon";
export { ChevronsLeftRightEllipsisIcon };
