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
export interface ChevronsDownIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ChevronsDownIconProps extends Omit<
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

const ChevronsDownIcon = forwardRef<
 ChevronsDownIconHandle,
 ChevronsDownIconProps
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

  const leadingChevron: Variants = {
   normal: { y: 0, opacity: 1 },
   animate: {
    y: [0, -1.5, 4, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     times: [0, 0.18, 0.55, 1],
    },
   },
  };

  const trailingChevron: Variants = {
   normal: { y: 0, opacity: 1 },
   animate: {
    y: [0, -1.5, 4, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     times: [0, 0.18, 0.55, 1],
     delay: 0.12 * duration,
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={controls}
      initial="normal"
     >
      <m.path
       d="m7 6 5 5 5-5"
       variants={trailingChevron}
       stroke="currentColor"
      />
      <m.path
       d="m7 13 5 5 5-5"
       variants={leadingChevron}
       stroke="currentColor"
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ChevronsDownIcon.displayName = "ChevronsDownIcon";
export { ChevronsDownIcon };
