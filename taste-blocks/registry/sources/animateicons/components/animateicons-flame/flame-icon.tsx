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
export interface FlameIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface FlameIconProps extends Omit<
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

const FlameIcon = forwardRef<FlameIconHandle, FlameIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 1.3,
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
    if (!isControlled.current) {
     controls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [controls, onMouseLeave],
  );

  const flameVariant: Variants = {
   normal: {
    scale: 1,
    y: 0,
    rotate: 0,
   },
   animate: {
    scale: [1, 1.05, 1.02, 1],
    y: [0, -2, -1, 0],
    rotate: [0, -2, 1, 0],
    transition: {
     duration,
     ease: "easeInOut",
    },
   },
  };

  const flickerVariant: Variants = {
   normal: { strokeDashoffset: 0 },
   animate: {
    strokeDashoffset: [0, -40, 0],
    transition: {
     duration: duration * 0.8,
     ease: "linear",
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
      variants={flameVariant}
     >
      <m.path
       d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
       variants={flickerVariant}
       style={{
        strokeDasharray: 120,
        transformOrigin: "12px 18px",
       }}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

FlameIcon.displayName = "FlameIcon";
export { FlameIcon };
