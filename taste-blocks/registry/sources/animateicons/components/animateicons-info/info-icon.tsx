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
export interface InfoIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface InfoIconProps extends Omit<
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

const InfoIcon = forwardRef<InfoIconHandle, InfoIconProps>(
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
    scale: [1, 1.08, 0.95, 1],
    transition: { duration: 0.7 * duration, ease: "easeInOut", repeat: 0 },
   },
  };

  const drawVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut", repeat: 0 },
   },
  };

  const pulseVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.3, 0.8, 1],
    opacity: [1, 0.5, 1],
    transition: { duration: 0.5 * duration, ease: "easeInOut", repeat: 0 },
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
      <m.circle cx="12" cy="12" r="10" variants={drawVariants} />
      <m.path d="M12 16v-4" variants={pulseVariants} />
      <m.path d="M12 8h.01" variants={pulseVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

InfoIcon.displayName = "InfoIcon";
export { InfoIcon };
