"use client";

import { cn } from "../../lib/utils";
import type { Transition, Variants } from "motion/react";
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
export interface CopyIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CopyIconProps extends Omit<
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

const CopyIcon = forwardRef<CopyIconHandle, CopyIconProps>(
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
  const defaultTransition: Transition = {
   type: "spring",
   stiffness: 160,
   damping: 17,
   mass: 1,
  };

  const boxVariants: Variants = {
   normal: {
    translateX: 0,
    translateY: 0,
    rotate: 0,
   },
   animate: {
    translateX: -3,
    translateY: -3,
    rotate: 360,
    transition: {
     ...defaultTransition,
     duration: 0.7 * duration,
    },
   },
  };

  const pathVariants: Variants = {
   normal: { x: 0, y: 0 },
   animate: {
    x: 3,
    y: 3,
    transition: defaultTransition,
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
     >
      <m.rect
       width="14"
       height="14"
       x="8"
       y="8"
       rx="2"
       ry="2"
       variants={boxVariants}
       animate={controls}
       transition={{
        ...defaultTransition,
        duration: 0.7 * duration,
       }}
      />
      <m.path
       d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
       variants={pathVariants}
       animate={controls}
       transition={defaultTransition}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CopyIcon.displayName = "CopyIcon";

export { CopyIcon };
