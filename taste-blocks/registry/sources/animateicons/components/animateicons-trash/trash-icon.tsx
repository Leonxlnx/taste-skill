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
export interface TrashIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface TrashIconProps extends Omit<
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

const TrashIcon = forwardRef<TrashIconHandle, TrashIconProps>(
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
    scale: [1, 1.03, 1],

    transition: { duration: 0.5 * duration, ease: "easeOut" },
   },
  };

  const lidBounce: Variants = {
   normal: { y: 0, rotate: 0, transformOrigin: "12px 6px" },
   animate: {
    rotate: [0, -10, 6, -3, 0],
    y: [0, -2, 0.5, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     delay: 0.05,
    },
   },
  };

  const barSnap: Variants = {
   normal: { scaleX: 1, opacity: 1 },
   animate: {
    scaleX: [0.85, 1.08, 1],
    opacity: [0.9, 1, 1],
    transition: { duration: 0.45 * duration, ease: "easeOut", delay: 0.1 },
   },
  };

  const binSettle: Variants = {
   normal: { y: 0, scaleY: 1, transformOrigin: "50% 100%" },
   animate: {
    scaleY: [1, 0.97, 1],
    transition: { duration: 0.5 * duration, ease: "easeOut", delay: 0.2 },
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
      <m.path
       d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
       variants={binSettle}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M3 6h18"
       variants={barSnap}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
       variants={lidBounce}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

TrashIcon.displayName = "TrashIcon";
export { TrashIcon };
