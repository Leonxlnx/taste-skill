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
export interface LinkIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface LinkIconProps extends Omit<
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

const LinkIcon = forwardRef<LinkIconHandle, LinkIconProps>(
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
  const leftPartControls = useAnimation();
  const rightPartControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      leftPartControls.start("normal");
      rightPartControls.start("normal");
     } else {
      leftPartControls.start("animate");
      rightPartControls.start("animate");
     }
    },
    stopAnimation: () => {
     leftPartControls.start("normal");
     rightPartControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     leftPartControls.start("animate");
     rightPartControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [leftPartControls, rightPartControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     leftPartControls.start("normal");
     rightPartControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [leftPartControls, rightPartControls],
  );

  const linkVariantsLeft: Variants = {
   normal: { scale: 1, rotate: 0, x: 0 },
   animate: {
    x: [0, -2, 0],
    rotate: [0, -3, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
    },
   },
  };

  const linkVariantsRight: Variants = {
   normal: { scale: 1, rotate: 0, x: 0 },
   animate: {
    x: [0, 2, 0],
    rotate: [0, 3, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
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
       d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
       variants={linkVariantsRight}
       initial="normal"
       animate={rightPartControls}
      />
      <m.path
       d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
       variants={linkVariantsLeft}
       initial="normal"
       animate={leftPartControls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

LinkIcon.displayName = "LinkIcon";
export { LinkIcon };
