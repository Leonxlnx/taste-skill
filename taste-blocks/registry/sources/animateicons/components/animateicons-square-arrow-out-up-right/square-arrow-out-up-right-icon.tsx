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
export interface SquareArrowOutUpRightIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface SquareArrowOutUpRightIconProps extends Omit<
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

const SquareArrowOutUpRightIcon = forwardRef<
 SquareArrowOutUpRightIconHandle,
 SquareArrowOutUpRightIconProps
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
  const boxControls = useAnimation();
  const arrowControls = useAnimation();
  const isControlled = useRef(false);
  const reduced = useReducedMotion();

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      boxControls.start("normal");
      arrowControls.start("normal");
     }
     boxControls.start("animate");
     arrowControls.start("animate");
    },
    stopAnimation: () => {
     boxControls.start("normal");
     arrowControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     boxControls.start("animate");
     arrowControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [boxControls, arrowControls, isAnimated, reduced, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     boxControls.start("normal");
     arrowControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [boxControls, arrowControls, onMouseLeave],
  );

  const boxVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
   },
  };

  const arrowVariants: Variants = {
   normal: { x: 0, y: 0, opacity: 1 },
   animate: {
    x: [0, 3, 0],
    y: [0, -3, 0],
    opacity: [1, 1, 1],
    transition: { duration: 0.6 * duration, ease: "easeInOut" },
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
       d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
       variants={boxVariants}
       initial="normal"
       animate={boxControls}
      />

      <m.path
       d="m21 3-9 9"
       variants={arrowVariants}
       initial="normal"
       animate={arrowControls}
      />

      <m.path
       d="M15 3h6v6"
       variants={arrowVariants}
       initial="normal"
       animate={arrowControls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

SquareArrowOutUpRightIcon.displayName = "SquareArrowOutUpRightIcon";
export { SquareArrowOutUpRightIcon };
