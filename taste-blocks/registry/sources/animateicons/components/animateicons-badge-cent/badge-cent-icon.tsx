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
export interface BadgeCentIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BadgeCentIconProps extends Omit<
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

const BadgeCentIcon = forwardRef<BadgeCentIconHandle, BadgeCentIconProps>(
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
  const outerControls = useAnimation();
  const lineControls = useAnimation();
  const semiControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      outerControls.start("normal");
      lineControls.start("normal");
      semiControls.start("normal");
     } else {
      outerControls.start("animate");
      lineControls.start("animate");
      semiControls.start("animate");
     }
    },
    stopAnimation: () => {
     outerControls.start("normal");
     lineControls.start("normal");
     semiControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     outerControls.start("animate");
     lineControls.start("animate");
     semiControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    outerControls,
    lineControls,
    semiControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     outerControls.start("normal");
     lineControls.start("normal");
     semiControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [outerControls, lineControls, semiControls, onMouseLeave],
  );

  const outerVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.02, 1],
    rotate: [0, 180, 0],
    transition: {
     duration: 1.1 * duration,
     ease: "easeInOut",
    },
   },
  };

  const lineVariants: Variants = {
   normal: { strokeDashoffset: 0, scaleY: 1, opacity: 1 },
   animate: {
    strokeDashoffset: [16, 0],
    scaleY: [1, 1.16, 0.98, 1],
    opacity: [0.9, 1, 1],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut",
     delay: 0.18,
    },
   },
  };

  const semiVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [80, 0],
    opacity: [0, 1],
    transition: {
     duration: 0.9 * duration,
     ease: [0.22, 0.8, 0.2, 1],
     delay: 0.32,
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
     <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
     >
      <m.path
       d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
       initial="normal"
       animate={outerControls}
       variants={outerVariants}
       style={{ strokeDasharray: 260, transformOrigin: "12px 12px" }}
      />
      <m.path
       d="M12 7v10"
       initial="normal"
       animate={lineControls}
       variants={lineVariants}
       style={{
        strokeDasharray: 16,
        strokeLinecap: "round",
        transformOrigin: "12px 12px",
       }}
      />
      <m.path
       d="M15.4 10a4 4 0 1 0 0 4"
       initial="normal"
       animate={semiControls}
       variants={semiVariants}
       style={{ strokeDasharray: 80, strokeLinecap: "round" }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BadgeCentIcon.displayName = "BadgeCentIcon";
export { BadgeCentIcon };
