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
export interface BookOpenTextIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BookOpenTextIconProps extends Omit<
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

const BookOpenTextIcon = forwardRef<
 BookOpenTextIconHandle,
 BookOpenTextIconProps
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
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e as any);
   },
   [controls, onMouseLeave],
  );

  const iconVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.04, 0.98, 1],
    rotate: [0, -2, 2, 0],
    transition: { duration: 1.1 * duration, ease: "easeInOut", repeat: 0 },
   },
  };

  const strokeVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: (i: number) => ({
    pathLength: [0.9, 1, 1],
    opacity: [0.7, 1, 1],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     delay: i * 0.12,
    },
   }),
  };

  const lineVariants: Variants = {
   normal: { opacity: 1, y: 0, scaleX: 1 },
   animate: (i: number) => ({
    opacity: [0.6, 1, 1],
    y: [1.5, -1, 0],
    scaleX: [0.9, 1.05, 1],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     delay: 0.2 + i * 0.1,
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
      variants={iconVariants}
     >
      <m.path
       d="M12 7v14"
       variants={strokeVariants}
       custom={0}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M16 12h2"
       variants={lineVariants}
       custom={0}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M16 8h2"
       variants={lineVariants}
       custom={1}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
       variants={strokeVariants}
       custom={1}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M6 12h2"
       variants={lineVariants}
       custom={2}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M6 8h2"
       variants={lineVariants}
       custom={3}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BookOpenTextIcon.displayName = "BookOpenTextIcon";
export { BookOpenTextIcon };
