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
export interface AccessibilityIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface AccessibilityIconProps extends Omit<
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

const AccessibilityIcon = forwardRef<
 AccessibilityIconHandle,
 AccessibilityIconProps
>(
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
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [controls, onMouseLeave],
  );

  const containerVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: -6,
    transition: {
     duration: 0.35,
     ease: "easeOut",
    },
   },
  };

  const wheelVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: 360,
    transition: {
     duration: 1.4 * duration,
     repeat: Infinity,
     ease: "linear",
    },
   },
  };
  const handVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: -25,
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     repeat: Infinity,
     repeatType: "mirror",
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
      variants={containerVariants}
     >
      <circle cx="16" cy="4" r="1" />
      <path d="m18 19 1-7-6 1" />
      <m.path d="m5 8 3-3 5.5 3-2.36 3.5" variants={handVariants} />
      <m.g variants={wheelVariants}>
       <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
       <path d="M13.76 17.5a5 5 0 0 0-6.88-6" />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

AccessibilityIcon.displayName = "AccessibilityIcon";
export { AccessibilityIcon };
