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
export interface ThumbsDownIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ThumbsDownIconProps extends Omit<
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

const ThumbsDownIcon = forwardRef<ThumbsDownIconHandle, ThumbsDownIconProps>(
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
    if (!isControlled.current) {
     controls.start("animate");
    } else onMouseEnter?.(e as any);
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

  const svgVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.08, 0.98, 1.03, 1],
    rotate: [0, -8, 6, -4, 0],
    transition: {
     duration: 0.95 * duration,
     ease: "easeInOut",
    },
   },
  };

  const stemVariants: Variants = {
   normal: { scaleY: 1, opacity: 1 },
   animate: {
    scaleY: [1, 0.92, 1.04, 1],
    opacity: [1, 0.85, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     delay: 0.08 * duration,
    },
   },
  };

  const thumbVariants: Variants = {
   normal: { rotate: 0, y: 0, scale: 1 },
   animate: {
    rotate: [0, -8, 6, -4, 0],
    y: [0, -4, -8, -4, 0],
    scale: [1, 1.05, 1.1, 1.04, 1],
    transition: {
     duration: 0.95 * duration,
     ease: "easeInOut",
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
      variants={svgVariants}
      initial="normal"
      animate={controls}
     >
      <m.path d="M17 14V2" variants={stemVariants} initial="normal" />

      <m.path
       d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"
       variants={thumbVariants}
       initial="normal"
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ThumbsDownIcon.displayName = "ThumbsDownIcon";
export { ThumbsDownIcon };
