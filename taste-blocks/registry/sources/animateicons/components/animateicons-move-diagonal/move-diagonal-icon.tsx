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
export interface MoveDiagonalIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MoveDiagonalIconProps extends Omit<
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

const MoveDiagonalIcon = forwardRef<
 MoveDiagonalIconHandle,
 MoveDiagonalIconProps
>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.6,
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
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.05, 1],
    transition: { duration: duration, ease: "easeInOut" },
   },
  };

  const topRightVariants: Variants = {
   normal: { x: 0, y: 0, opacity: 1 },
   animate: {
    x: [1, 3, 0],
    y: [-1, -3, 0],
    opacity: [1, 0.7, 1],
    transition: { duration: duration, ease: "easeInOut" },
   },
  };

  const bottomLeftVariants: Variants = {
   normal: { x: 0, y: 0, opacity: 1 },
   animate: {
    x: [-1, -3, 0],
    y: [1, 3, 0],
    opacity: [1, 0.7, 1],
    transition: { duration: duration, ease: "easeInOut" },
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
      <path d="M19 5 5 19" />

      <m.path
       d="M13 5h6v6"
       variants={topRightVariants}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M11 19H5v-6"
       variants={bottomLeftVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MoveDiagonalIcon.displayName = "MoveDiagonalIcon";
export { MoveDiagonalIcon };
