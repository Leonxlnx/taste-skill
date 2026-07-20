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
export interface PhilippinePesoIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface PhilippinePesoIconProps extends Omit<
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

const PhilippinePesoIcon = forwardRef<
 PhilippinePesoIconHandle,
 PhilippinePesoIconProps
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
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e as any);
   },
   [controls, onMouseLeave],
  );

  const svgVariants: Variants = {
   normal: { scale: 1, rotate: 0, y: 0 },
   animate: {
    scale: [1, 1.06, 1],
    rotate: [0, -2, 2, 0],
    y: [0, -1, 0],
    transition: { duration: 1.2 * duration, ease: "easeInOut" },
   },
  };

  const topStroke: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.7, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
     delay: 0.06,
    },
   },
  };

  const midStroke: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.7, 1],
    transition: {
     duration: 0.55 * duration,
     ease: "easeInOut",
     delay: 0.16,
    },
   },
  };

  const pStroke: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.8, 1],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     delay: 0.26,
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
      variants={svgVariants}
      className="lucide lucide-philippine-peso-icon lucide-philippine-peso"
     >
      <g opacity={0.35}>
       <path d="M20 11H4" />
       <path d="M20 7H4" />
       <path d="M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7" />
      </g>

      <m.path
       d="M20 7H4"
       pathLength={1}
       variants={topStroke}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M20 11H4"
       pathLength={1}
       variants={midStroke}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M7 21V4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 12H7"
       pathLength={1}
       variants={pStroke}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

PhilippinePesoIcon.displayName = "PhilippinePesoIcon";
export { PhilippinePesoIcon };
