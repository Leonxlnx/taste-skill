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
export interface CodeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CodeIconProps extends Omit<
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

const CodeIcon = forwardRef<CodeIconHandle, CodeIconProps>(
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
   normal: {
    scaleX: 1,
   },
   animate: {
    scaleX: [1, 0.75, 1],
    transition: {
     duration: 0.28 * duration,
     ease: "easeOut",
    },
   },
  };

  const leftBracket: Variants = {
   normal: {
    x: 0,
    opacity: 1,
   },
   animate: {
    x: [0, 3, 0],
    opacity: [1, 0.6, 1],
    transition: {
     duration: 0.32 * duration,
     ease: "easeOut",
    },
   },
  };

  const rightBracket: Variants = {
   normal: {
    x: 0,
    opacity: 1,
   },
   animate: {
    x: [0, -3, 0],
    opacity: [1, 0.6, 1],
    transition: {
     duration: 0.32 * duration,
     delay: 0.05 * duration,
     ease: "easeOut",
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
     >
      <m.g variants={groupVariants} initial="normal" animate={controls}>
       <m.path
        d="m8 6-6 6 6 6"
        variants={leftBracket}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="m16 18 6-6-6-6"
        variants={rightBracket}
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

CodeIcon.displayName = "CodeIcon";
export { CodeIcon };
