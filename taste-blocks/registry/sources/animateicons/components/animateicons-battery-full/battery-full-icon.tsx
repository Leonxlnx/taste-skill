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
export interface BatteryFullIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BatteryFullIconProps extends Omit<
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

const BatteryFullIcon = forwardRef<BatteryFullIconHandle, BatteryFullIconProps>(
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
    rotate: [0, -2, 2, 0],
    scale: [1, 1.05, 0.95, 1],
    transition: {
     duration: 1.5 * duration,
     ease: [0.42, 0, 0.58, 1],
     repeat: 0,
    },
   },
  };

  const barVariants: Variants = {
   normal: { opacity: 1, scaleY: 1 },
   animate: (i: number) => ({
    opacity: [0.4, 1, 0.8],
    scaleY: [0.6, 1, 0.8],
    transition: {
     duration: 1 * duration,
     ease: [0.42, 0, 0.58, 1],
     repeat: 0,
     delay: i * 0.25,
    },
   }),
  };

  const rectVariants: Variants = {
   normal: { opacity: 1 },
   animate: {
    opacity: [0.6, 1, 0.7, 1],
    transition: {
     duration: 1.2 * duration,
     ease: [0.42, 0, 0.58, 1],
     repeat: 0,
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
      variants={svgVariants}
     >
      <m.path d="M10 10v4" variants={barVariants} custom={0} />
      <m.path d="M14 10v4" variants={barVariants} custom={1} />
      <m.path d="M6 10v4" variants={barVariants} custom={2} />
      <m.rect
       x="2"
       y="6"
       width="16"
       height="12"
       rx="2"
       variants={rectVariants}
      />
      <m.path d="M22 14v-4" variants={rectVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BatteryFullIcon.displayName = "BatteryFullIcon";
export { BatteryFullIcon };
