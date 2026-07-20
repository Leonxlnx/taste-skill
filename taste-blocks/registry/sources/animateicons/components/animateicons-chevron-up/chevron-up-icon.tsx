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
export interface ChevronUpIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ChevronUpIconProps extends Omit<
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

const ChevronUpIcon = forwardRef<ChevronUpIconHandle, ChevronUpIconProps>(
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

  const leadingArrow: Variants = {
   normal: { y: 0, opacity: 1 },
   animate: {
    y: [0, 1.5, -4, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     times: [0, 0.2, 0.55, 1],
    },
   },
  };

  const trailingArrow: Variants = {
   normal: { y: 0, opacity: 0 },
   animate: {
    y: [0, -9],
    opacity: [0, 0.45, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeOut",
     delay: 0.08 * duration,
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
     >
      <m.path
       d="m18 15-6-6-6 6"
       variants={trailingArrow}
       stroke="currentColor"
      />
      <m.path
       d="m18 15-6-6-6 6"
       variants={leadingArrow}
       stroke="currentColor"
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ChevronUpIcon.displayName = "ChevronUpIcon";
export { ChevronUpIcon };
