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
export interface SwordsIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface SwordsIconProps extends Omit<
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

const SwordsIcon = forwardRef<SwordsIconHandle, SwordsIconProps>(
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

  const svgVariants: Variants = {
   normal: { rotate: 0, scale: 1 },
   animate: {
    rotate: [0, -5, 5, -3, 3, 0],
    scale: [1, 1.05, 0.95, 1],
    transition: { duration: 1.5 * duration, ease: "easeInOut", repeat: 0 },
   },
  };

  const pathVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    transition: { duration: 1.2 * duration, ease: "easeInOut", repeat: 0 },
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
      variants={svgVariants}
     >
      <m.polyline
       points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"
       variants={pathVariants}
      />
      <m.line x1="13" x2="19" y1="19" y2="13" variants={pathVariants} />
      <m.line x1="16" x2="20" y1="16" y2="20" variants={pathVariants} />
      <m.line x1="19" x2="21" y1="21" y2="19" variants={pathVariants} />
      <m.polyline
       points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"
       variants={pathVariants}
      />
      <m.line x1="5" x2="9" y1="14" y2="18" variants={pathVariants} />
      <m.line x1="7" x2="4" y1="17" y2="20" variants={pathVariants} />
      <m.line x1="3" x2="5" y1="19" y2="21" variants={pathVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

SwordsIcon.displayName = "SwordsIcon";
export { SwordsIcon };
