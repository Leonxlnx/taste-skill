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
export interface LogoutIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface LogoutIconProps extends Omit<
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

const LogoutIcon = forwardRef<LogoutIconHandle, LogoutIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 28,
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
    scale: [1, 1.1, 0.95, 1],
    rotate: [0, 3, -2, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
    },
   },
  };

  const arrowVariants: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [8, -2, 0],
    opacity: [0, 1, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeOut",
    },
   },
  };

  const doorVariants: Variants = {
   normal: { pathLength: 1 },
   animate: {
    pathLength: [0, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     delay: 0.1,
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
      variants={iconVariants}
     >
      <m.path d="m16 17 5-5-5-5" variants={arrowVariants} />
      <m.path d="M21 12H9" variants={arrowVariants} />

      <m.path
       d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
       variants={doorVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

LogoutIcon.displayName = "LogoutIcon";
export { LogoutIcon };
