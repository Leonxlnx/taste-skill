"use client";

import { cn } from "../../lib/utils";

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
export interface SnowFlakeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface SnowFlakeIconProps extends Omit<
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

const SnowFlakeIcon = forwardRef<SnowFlakeIconHandle, SnowFlakeIconProps>(
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

  const pathVariants = {
   normal: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.3 * duration },
   },
   animate: {
    pathLength: [1, 0.3, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 0.8 * duration },
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
      variants={{
       normal: {
        rotate: 0,
        scale: 1,
        transition: { duration: 0.3 * duration },
       },
       animate: {
        rotate: [0, 10, -10, 0],
        scale: [1, 1.05, 1],
        transition: { duration: 1 * duration },
       },
      }}
      animate={controls}
      initial="normal"
     >
      <m.path d="m10 20-1.25-2.5L6 18" variants={pathVariants} />
      <m.path d="M10 4 8.75 6.5 6 6" variants={pathVariants} />
      <m.path d="m14 20 1.25-2.5L18 18" variants={pathVariants} />
      <m.path d="m14 4 1.25 2.5L18 6" variants={pathVariants} />
      <m.path d="m17 21-3-6h-4" variants={pathVariants} />
      <m.path d="m17 3-3 6 1.5 3" variants={pathVariants} />
      <m.path d="M2 12h6.5L10 9" variants={pathVariants} />
      <m.path d="m20 10-1.5 2 1.5 2" variants={pathVariants} />
      <m.path d="M22 12h-6.5L14 15" variants={pathVariants} />
      <m.path d="m4 10 1.5 2L4 14" variants={pathVariants} />
      <m.path d="m7 21 3-6-1.5-3" variants={pathVariants} />
      <m.path d="m7 3 3 6h4" variants={pathVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

SnowFlakeIcon.displayName = "SnowFlakeIcon";
export { SnowFlakeIcon };
