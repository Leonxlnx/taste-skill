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
export interface SprayCanIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface SprayCanIconProps extends Omit<
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

const SprayCanIcon = forwardRef<SprayCanIconHandle, SprayCanIconProps>(
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
    rotate: [0, -4, 4, -2, 2, 0],
    transition: { duration: 2 * duration, ease: "easeInOut", repeat: 0 },
   },
  };

  const sprayVariants: Variants = {
   normal: { scale: 1, opacity: 1, y: 0 },
   animate: (i: number) => ({
    scale: [1, 1.3, 0.7, 1],
    opacity: [1, 0.4, 1],
    y: [0, -2, 2, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     repeat: 0,
     delay: i * 0.2,
    },
   }),
  };

  const sprayDots = [
   "M3 3h.01",
   "M7 5h.01",
   "M11 7h.01",
   "M3 7h.01",
   "M7 9h.01",
   "M3 11h.01",
  ];

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
      {sprayDots.map((d, i) => (
       <m.path
        key={i}
        d={d}
        variants={sprayVariants}
        custom={i}
        animate={controls}
        initial="normal"
       />
      ))}
      <rect width="4" height="4" x="15" y="5" />
      <path d="m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2" />
      <path d="m13 14 8-2" />
      <path d="m13 19 8-2" />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

SprayCanIcon.displayName = "SprayCanIcon";
export { SprayCanIcon };
