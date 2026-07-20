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
export interface BlendIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BlendIconProps extends Omit<
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

const BlendIcon = forwardRef<BlendIconHandle, BlendIconProps>(
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

  const groupVariants: Variants = {
   normal: { rotate: 0, scale: 1 },
   animate: {
    rotate: [0, -1.5, 1.5, 0],
    scale: [1, 1.02, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut" as const,
    },
   },
  };

  const leftCircle: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1, x: 0 },
   animate: {
    strokeDashoffset: [48, 0],
    opacity: [0.45, 1],
    transition: { duration: 0.6 * duration, ease: "easeInOut" },
   },
  };

  const rightCircle: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1, x: 0 },
   animate: {
    strokeDashoffset: [48, 0],
    opacity: [0.45, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
     delay: 0.09,
    },
   },
  };

  const overlapPulse: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.06, 1],
    opacity: [0.9, 1, 1],
    transition: {
     duration: 0.5 * duration,
     ease: "easeInOut",
     delay: 0.25,
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
      className="lucide lucide-blend-icon lucide-blend"
     >
      <m.g variants={groupVariants} initial="normal" animate={controls}>
       <m.circle
        cx="9"
        cy="9"
        r="7"
        strokeDasharray="48"
        strokeDashoffset="48"
        variants={leftCircle}
        initial="normal"
        animate={controls}
       />
       <m.g variants={overlapPulse} initial="normal" animate={controls}>
        <m.circle
         cx="15"
         cy="15"
         r="7"
         strokeDasharray="48"
         strokeDashoffset="48"
         variants={rightCircle}
         initial="normal"
         animate={controls}
        />
       </m.g>
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BlendIcon.displayName = "BlendIcon";
export { BlendIcon };
