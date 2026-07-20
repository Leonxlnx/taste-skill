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
export interface IndianRupeeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface IndianRupeeIconProps extends Omit<
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

const IndianRupeeIcon = forwardRef<IndianRupeeIconHandle, IndianRupeeIconProps>(
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

  const ease = [0.12, 1, 0.25, 1] as const;

  const drawTop: Variants = {
   normal: { strokeDasharray: "1", strokeDashoffset: 0 },
   animate: {
    strokeDasharray: "1",
    strokeDashoffset: [1, 0],
    transition: { duration: 0.5 * duration, ease, delay: 0.06 },
   },
  };

  const drawMid: Variants = {
   normal: { strokeDasharray: "1", strokeDashoffset: 0 },
   animate: {
    strokeDasharray: "1",
    strokeDashoffset: [1, 0],
    transition: {
     duration: 0.5 * duration,
     ease: "easeInOut",
     delay: 0.16,
    },
   },
  };

  const drawCurve: Variants = {
   normal: { strokeDasharray: "1", strokeDashoffset: 0 },
   animate: {
    strokeDasharray: "1",
    strokeDashoffset: [1, 0],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut",
     delay: 0.26,
    },
   },
  };

  const drawNotch: Variants = {
   normal: { strokeDasharray: "1", strokeDashoffset: 0 },
   animate: {
    strokeDasharray: "1",
    strokeDashoffset: [1, 0],
    transition: {
     duration: 0.45 * duration,
     ease: "easeInOut",
     delay: 0.42,
    },
   },
  };

  const groupSettle: Variants = {
   normal: { scale: 1, x: 0, y: 0 },
   animate: {
    scale: [1, 1.05, 1],
    x: [0, -1, 0],
    y: [0, -1, 0],
    transition: { duration: 0.6 * duration, ease },
   },
  };

  const diagonalResolve: Variants = {
   normal: {
    strokeDasharray: "1",
    strokeDashoffset: 0,
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
   },
   animate: {
    strokeDasharray: "1",
    strokeDashoffset: [1, 0],
    x: [-0.3, 0.5, 0],
    y: [-0.2, 0.5, 0],
    scale: [1, 1.05, 1],
    opacity: [1, 1],
    transition: { duration: 0.6 * duration, ease, delay: 0.5 },
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
      className="lucide lucide-indian-rupee-icon lucide-indian-rupee"
     >
      <m.g variants={groupSettle} initial="normal" animate={controls}>
       <g opacity={0.3}>
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M9 13c6.667 0 6.667-10 0-10" />
        <path d="M6 13h3" />
        <path d="m6 13 8.5 8" />
       </g>

       <m.path
        d="M6 3h12"
        pathLength={1}
        variants={drawTop}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="M6 8h12"
        pathLength={1}
        variants={drawMid}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="M9 13c6.667 0 6.667-10 0-10"
        pathLength={1}
        variants={drawCurve}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="M6 13h3"
        pathLength={1}
        variants={drawNotch}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="m6 13 8.5 8"
        pathLength={1}
        variants={diagonalResolve}
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

IndianRupeeIcon.displayName = "IndianRupeeIcon";
export { IndianRupeeIcon };
