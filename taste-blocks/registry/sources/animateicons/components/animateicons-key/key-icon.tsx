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
export interface KeyIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface KeyIconProps extends Omit<
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

const KeyIcon = forwardRef<KeyIconHandle, KeyIconProps>(
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

  const ease = [0.16, 1, 0.3, 1] as const;

  const sequence: Variants = {
   normal: { scale: 1, rotate: 0, x: 0, y: 0 },
   animate: {
    scale: [1, 1.01, 1.01, 1],
    rotate: [0, -6, 0, 6, 0],
    x: [0, 0, 0, 0, 0],
    y: [0, 0, 0, 0, 0],
    transition: {
     duration: 0.9 * duration,
     ease,
     times: [0, 0.25, 0.5, 0.75, 1],
    },
   },
  };

  const ringLock: Variants = {
   normal: { strokeDashoffset: 0, scale: 1, opacity: 1 },
   animate: {
    scale: [1, 0.98, 1, 1.02, 1],
    opacity: [1, 1, 1, 1, 1],
    transition: {
     duration: 0.9 * duration,
     ease,
     times: [0, 0.25, 0.5, 0.75, 1],
    },
   },
  };

  const shaftSlide: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1, x: 0 },
   animate: {
    x: [0, -0.6, 0, 0.6, 0],
    opacity: [1, 1, 1, 1, 1],
    transition: {
     duration: 0.9 * duration,
     ease,
     times: [0, 0.25, 0.5, 0.75, 1],
    },
   },
  };

  const headTurn: Variants = {
   normal: { x: 0, y: 0, rotate: 0, originX: 19, originY: 6 },
   animate: {
    rotate: [0, -18, 0, 18, 0],
    x: [0, -1, 0, 1, 0],
    y: [0, -0.4, 0, 0.4, 0],
    transition: {
     duration: 0.9 * duration,
     ease,
     times: [0, 0.25, 0.5, 0.75, 1],
     delay: 0.04,
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
      className="lucide lucide-key-icon lucide-key"
     >
      <m.g variants={sequence} initial="normal" animate={controls}>
       <m.circle
        cx="7.5"
        cy="15.5"
        r="5.5"
        variants={ringLock}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="m21 2-9.6 9.6"
        variants={shaftSlide}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"
        variants={headTurn}
        initial="normal"
        animate={controls}
       />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

KeyIcon.displayName = "KeyIcon";
export { KeyIcon };
