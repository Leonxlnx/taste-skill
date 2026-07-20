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
export interface UnlinkIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface UnlinkIconProps extends Omit<
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

const UnlinkIcon = forwardRef<UnlinkIconHandle, UnlinkIconProps>(
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
  const leftChainControls = useAnimation();
  const rightChainControls = useAnimation();
  const sparksControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      leftChainControls.start("normal");
      rightChainControls.start("normal");
      sparksControls.start("normal");
     } else {
      leftChainControls.start("animate");
      rightChainControls.start("animate");
      sparksControls.start("animate");
     }
    },
    stopAnimation: () => {
     leftChainControls.start("normal");
     rightChainControls.start("normal");
     sparksControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     leftChainControls.start("animate");
     rightChainControls.start("animate");
     sparksControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    leftChainControls,
    rightChainControls,
    sparksControls,
    reduced,
    isAnimated,
    onMouseEnter,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     leftChainControls.start("normal");
     rightChainControls.start("normal");
     sparksControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [leftChainControls, rightChainControls, sparksControls],
  );

  const leftVariants: Variants = {
   normal: { x: 0, rotate: 0 },
   animate: {
    x: [-2, -4, -2, 0],
    rotate: [-5, -8, -5, 0],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
   },
  };

  const rightVariants: Variants = {
   normal: { x: 0, rotate: 0 },
   animate: {
    x: [2, 4, 2, 0],
    rotate: [5, 8, 5, 0],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
   },
  };

  const sparksVariants: Variants = {
   normal: { opacity: 1, pathLength: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1, 0, 1],
    transition: { duration: 0.5 * duration, ease: "easeInOut" },
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
       d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"
       variants={rightVariants}
       initial="normal"
       animate={rightChainControls}
      />
      <m.path
       d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"
       variants={leftVariants}
       initial="normal"
       animate={leftChainControls}
      />

      <m.line
       x1="8"
       x2="8"
       y1="2"
       y2="5"
       variants={sparksVariants}
       initial="normal"
       animate={sparksControls}
      />
      <m.line
       x1="2"
       x2="5"
       y1="8"
       y2="8"
       variants={sparksVariants}
       initial="normal"
       animate={sparksControls}
      />
      <m.line
       x1="16"
       x2="16"
       y1="19"
       y2="22"
       variants={sparksVariants}
       initial="normal"
       animate={sparksControls}
      />
      <m.line
       x1="19"
       x2="22"
       y1="16"
       y2="16"
       variants={sparksVariants}
       initial="normal"
       animate={sparksControls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

UnlinkIcon.displayName = "UnlinkIcon";
export { UnlinkIcon };
