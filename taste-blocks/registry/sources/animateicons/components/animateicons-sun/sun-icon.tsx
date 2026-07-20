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
export interface SunIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface SunIconProps extends Omit<
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

const SunIcon = forwardRef<SunIconHandle, SunIconProps>(
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
     onMouseLeave?.(e);
    }
   },
   [controls, onMouseLeave],
  );

  const svgVariant: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: 12,
    transition: {
     duration,
     ease: [0.22, 1, 0.36, 1],
    },
   },
  };

  const centerVariant: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.18, 1],
    transition: {
     duration,
     ease: "easeInOut",
    },
   },
  };

  const rayVariant: Variants = {
   normal: { opacity: 1 },
   animate: {
    opacity: [1, 0.7, 1],
    transition: {
     duration,
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
     <m.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={controls}
      initial="normal"
      variants={svgVariant}
     >
      <m.circle cx="12" cy="12" r="4" variants={centerVariant} />
      <m.path d="M12 2v2" variants={rayVariant} />
      <m.path d="M12 20v2" variants={rayVariant} />
      <m.path d="m4.93 4.93 1.41 1.41" variants={rayVariant} />
      <m.path d="m17.66 17.66 1.41 1.41" variants={rayVariant} />
      <m.path d="M2 12h2" variants={rayVariant} />
      <m.path d="M20 12h2" variants={rayVariant} />
      <m.path d="m6.34 17.66-1.41 1.41" variants={rayVariant} />
      <m.path d="m19.07 4.93-1.41 1.41" variants={rayVariant} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

SunIcon.displayName = "SunIcon";
export { SunIcon };
