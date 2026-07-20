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
export interface AnnoyedIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface AnnoyedIconProps extends Omit<
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

const AnnoyedIcon = forwardRef<AnnoyedIconHandle, AnnoyedIconProps>(
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

  const container: Variants = {
   normal: { rotate: 0, x: 0 },
   animate: {
    rotate: [0, -2, 2, 0],
    x: [0, -0.5, 0.5, 0],
    transition: {
     duration: 0.45 * duration,
     ease: "easeOut",
    },
   },
  };

  const face: Variants = {
   normal: { y: 0 },
   animate: {
    y: [0, 0.5, 0],
    transition: {
     duration: 0.3 * duration,
     ease: "easeOut",
    },
   },
  };

  const eye = (dir: number): Variants => ({
   normal: { x: 0 },
   animate: {
    x: [0, dir, 0],
    transition: {
     duration: 0.25 * duration,
     ease: "easeOut",
    },
   },
  });

  const mouth: Variants = {
   normal: { scaleX: 1 },
   animate: {
    scaleX: [1, 0.9, 1],
    transition: {
     duration: 0.3 * duration,
     ease: "easeOut",
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
      variants={container}
      initial="normal"
      animate={controls}
     >
      <m.circle cx="12" cy="12" r="10" variants={face} />

      <m.path d="M8 9h2" variants={eye(-1)} />
      <m.path d="M14 9h2" variants={eye(1)} />

      <m.path d="M8 15h8" variants={mouth} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

AnnoyedIcon.displayName = "AnnoyedIcon";
export { AnnoyedIcon };
