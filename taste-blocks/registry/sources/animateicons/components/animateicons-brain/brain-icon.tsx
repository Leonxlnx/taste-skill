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
 useMemo,
 useRef,
 type HTMLAttributes,
} from "react";
export interface BrainIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BrainIconProps extends Omit<
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

const BrainIcon = forwardRef<BrainIconHandle, BrainIconProps>(
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
  const groupControls = useAnimation();
  const pulseControls = useAnimation();
  const sparkControlsL = useAnimation();
  const sparkControlsR = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      groupControls.start("normal");
      pulseControls.start("normal");
      sparkControlsL.start("normal");
      sparkControlsR.start("normal");
     } else {
      groupControls.start("animate");
      pulseControls.start("animate");
      sparkControlsL.start("animate");
      sparkControlsR.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     pulseControls.start("normal");
     sparkControlsL.start("normal");
     sparkControlsR.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     groupControls.start("animate");
     pulseControls.start("animate");
     sparkControlsL.start("animate");
     sparkControlsR.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    pulseControls,
    sparkControlsL,
    sparkControlsR,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     groupControls.start("normal");
     pulseControls.start("normal");
     sparkControlsL.start("normal");
     sparkControlsR.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [groupControls, pulseControls, sparkControlsL, sparkControlsR, onMouseLeave],
  );

  const microTilt: Variants = useMemo(
   () => ({
    normal: { rotate: 0, scale: 1 },
    animate: {
     rotate: [0, -2.2, 1.2, 0],
     scale: [1, 1.015, 1],
     transition: { duration: 0.7 * duration, ease: "easeInOut" },
    },
   }),
   [],
  );

  const spinePulse: Variants = useMemo(
   () => ({
    normal: { pathLength: 1, opacity: 1 },
    animate: {
     pathLength: [0, 1],
     opacity: [0.55, 1],
     transition: {
      duration: 0.5 * duration,
      ease: "easeInOut",
      delay: 0.06,
     },
    },
   }),
   [],
  );

  const lobeBreatheA: Variants = useMemo(
   () => ({
    normal: { pathLength: 1, opacity: 1, scale: 1 },
    animate: {
     pathLength: [0, 1],
     opacity: [0.6, 1],
     scale: [0.98, 1.02, 1],
     transition: {
      duration: 0.6 * duration,
      ease: "easeInOut",
      delay: 0.12,
     },
    },
   }),
   [],
  );

  const lobeBreatheB: Variants = useMemo(
   () => ({
    normal: { pathLength: 1, opacity: 1, scale: 1 },
    animate: {
     pathLength: [0, 1],
     opacity: [0.6, 1],
     scale: [1.02, 0.98, 1],
     transition: {
      duration: 0.62 * duration,
      ease: "easeInOut",
      delay: 0.18,
     },
    },
   }),
   [],
  );

  const synapseSparkL: Variants = useMemo(
   () => ({
    normal: { pathLength: 0, opacity: 0 },
    animate: {
     pathLength: [0, 1],
     opacity: [0, 1, 0],
     transition: {
      duration: 0.55 * duration,
      ease: "easeInOut",
      delay: 0.26,
     },
    },
   }),
   [],
  );

  const synapseSparkR: Variants = useMemo(
   () => ({
    normal: { pathLength: 0, opacity: 0 },
    animate: {
     pathLength: [0, 1],
     opacity: [0, 1, 0],
     transition: {
      duration: 0.55 * duration,
      ease: "easeInOut",
      delay: 0.34,
     },
    },
   }),
   [],
  );

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
      className="lucide lucide-brain-icon lucide-brain"
     >
      <m.g variants={microTilt} initial="normal" animate={groupControls}>
       <m.path
        d="M12 18V5"
        variants={spinePulse}
        initial="normal"
        animate={pulseControls}
       />

       <m.path
        d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"
        variants={lobeBreatheA}
        initial="normal"
        animate={groupControls}
       />
       <m.path
        d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"
        variants={lobeBreatheB}
        initial="normal"
        animate={groupControls}
       />

       <m.path
        d="M17.997 5.125a4 4 0 0 1 2.526 5.77"
        variants={lobeBreatheA}
        initial="normal"
        animate={groupControls}
       />
       <m.path
        d="M18 18a4 4 0 0 0 2-7.464"
        variants={lobeBreatheB}
        initial="normal"
        animate={groupControls}
       />
       <m.path
        d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"
        variants={lobeBreatheA}
        initial="normal"
        animate={groupControls}
       />
       <m.path
        d="M6 18a4 4 0 0 1-2-7.464"
        variants={lobeBreatheB}
        initial="normal"
        animate={groupControls}
       />
       <m.path
        d="M6.003 5.125a4 4 0 0 0-2.526 5.77"
        variants={lobeBreatheA}
        initial="normal"
        animate={groupControls}
       />

       <m.path
        d="M8.5 11.6 10.2 10.4"
        stroke="currentColor"
        strokeWidth="1.4"
        variants={synapseSparkL}
        initial="normal"
        animate={sparkControlsL}
       />
       <m.path
        d="M13.8 9.4 15.6 10.7"
        stroke="currentColor"
        strokeWidth="1.4"
        variants={synapseSparkR}
        initial="normal"
        animate={sparkControlsR}
       />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BrainIcon.displayName = "BrainIcon";
export { BrainIcon };
