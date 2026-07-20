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
export interface SaudiRiyalIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface SaudiRiyalIconProps extends Omit<
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

const SaudiRiyalIcon = forwardRef<SaudiRiyalIconHandle, SaudiRiyalIconProps>(
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
   normal: { scale: 1, rotate: 0, y: 0 },
   animate: {
    scale: [1, 1.06, 1],
    rotate: [0, -2, 2, 0],
    y: [0, -1, 0],
    transition: { duration: 1.2 * duration, ease: "easeInOut" },
   },
  };

  const leftMain: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.7, 1],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut",
     delay: 0.06,
    },
   },
  };

  const crossStroke: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.75, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
     delay: 0.18,
    },
   },
  };

  const rightMain: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.8, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut", delay: 0.3 },
   },
  };

  const tailStroke: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.8, 1],
    transition: {
     duration: 0.5 * duration,
     ease: "easeInOut",
     delay: 0.44,
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
      className="lucide lucide-saudi-riyal-icon lucide-saudi-riyal"
     >
      <g opacity={0.35}>
       <path d="m20 19.5-5.5 1.2" />
       <path d="M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2" />
       <path d="m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2" />
       <path d="M20 10 4 13.5" />
      </g>

      <m.path
       d="m2.978 19.351 5.549-1.363A2 2 0 0 0 10 16V2"
       pathLength={1}
       variants={leftMain}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M20 10 4 13.5"
       pathLength={1}
       variants={crossStroke}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M14.5 4v11.22a1 1 0 0 0 1.242.97L20 15.2"
       pathLength={1}
       variants={rightMain}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="m20 19.5-5.5 1.2"
       pathLength={1}
       variants={tailStroke}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

SaudiRiyalIcon.displayName = "SaudiRiyalIcon";
export { SaudiRiyalIcon };
