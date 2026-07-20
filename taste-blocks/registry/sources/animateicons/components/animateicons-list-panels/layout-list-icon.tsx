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
export interface LayoutListIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface LayoutListIconProps extends Omit<
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

const LayoutListIcon = forwardRef<LayoutListIconHandle, LayoutListIconProps>(
 (
  {
   className,
   size = 24,
   duration = 1,
   isAnimated = true,
   color,
   onMouseEnter,
   onMouseLeave,
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
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e as any);
   },
   [controls, onMouseLeave],
  );

  const boxVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: (i: number) => ({
    scale: [0.85, 1.05, 1],
    opacity: [0.6, 1],
    transition: {
     duration: 0.35 * duration,
     delay: i * 0.08,
     ease: "easeOut",
    },
   }),
  };

  const lineVariants: Variants = {
   normal: { scaleX: 1 },
   animate: (i: number) => ({
    scaleX: [0, 1],
    transition: {
     duration: 0.3 * duration,
     delay: 0.15 + i * 0.07,
     ease: "easeOut",
    },
   }),
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
     >
      <m.rect
       width="7"
       height="7"
       x="3"
       y="3"
       rx="1"
       variants={boxVariants}
       custom={0}
      />
      <m.rect
       width="7"
       height="7"
       x="3"
       y="14"
       rx="1"
       variants={boxVariants}
       custom={1}
      />
      <m.path
       d="M14 4h7"
       variants={lineVariants}
       custom={0}
       style={{ transformOrigin: "left" }}
      />
      <m.path
       d="M14 9h7"
       variants={lineVariants}
       custom={1}
       style={{ transformOrigin: "left" }}
      />
      <m.path
       d="M14 15h7"
       variants={lineVariants}
       custom={2}
       style={{ transformOrigin: "left" }}
      />
      <m.path
       d="M14 20h7"
       variants={lineVariants}
       custom={3}
       style={{ transformOrigin: "left" }}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

LayoutListIcon.displayName = "LayoutListIcon";
export { LayoutListIcon };
