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
export interface ScanLineIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ScanLineIconProps extends Omit<
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

const ScanLineIcon = forwardRef<ScanLineIconHandle, ScanLineIconProps>(
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

  const handleLeave = useCallback(() => {
   if (!isControlled.current) controls.start("normal");
  }, [controls]);

  const frame: Variants = {
   normal: { opacity: 1 },
   animate: {
    opacity: [1, 0.65, 1],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut",
     repeat: Infinity,
    },
   },
  };

  const scanLine: Variants = {
   normal: { y: 0, opacity: 1 },
   animate: {
    y: [-6, 6, -6],
    opacity: [0.4, 1, 0.4],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     repeat: Infinity,
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
      initial="normal"
      animate={controls}
     >
      <m.path d="M3 7V5a2 2 0 0 1 2-2h2" variants={frame} />
      <m.path d="M17 3h2a2 2 0 0 1 2 2v2" variants={frame} />
      <m.path d="M21 17v2a2 2 0 0 1-2 2h-2" variants={frame} />
      <m.path d="M7 21H5a2 2 0 0 1-2-2v-2" variants={frame} />

      <m.path d="M7 12h10" variants={scanLine} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ScanLineIcon.displayName = "ScanLineIcon";
export { ScanLineIcon };
