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
export interface MenuIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MenuIconProps extends Omit<
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

const MenuIcon = forwardRef<MenuIconHandle, MenuIconProps>(
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
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) controls.start("animate");
    else onMouseEnter?.(e as any);
   },
   [controls, reduced, isAnimated, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e);
   },
   [controls, onMouseLeave],
  );

  const topVariants: Variants = {
   normal: {
    x: 0,
    scaleX: 1,
   },
   animate: {
    x: 3,
    scaleX: 0.85,
    transition: {
     duration: 0.25 * duration,
     ease: "easeOut",
     delay: 0,
    },
   },
  };

  const middleVariants: Variants = {
   normal: {
    x: 0,
    scaleX: 1,
   },
   animate: {
    x: 5,
    scaleX: 0.7,
    transition: {
     duration: 0.25 * duration,
     ease: "easeOut",
     delay: 0.05 * duration,
    },
   },
  };

  const bottomVariants: Variants = {
   normal: {
    x: 0,
    scaleX: 1,
   },
   animate: {
    x: 7,
    scaleX: 0.55,
    transition: {
     duration: 0.25 * duration,
     ease: "easeOut",
     delay: 0.1 * duration,
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
     >
      <m.path
       d="M4 6h16"
       variants={topVariants}
       style={{ transformOrigin: "left center" }}
      />

      <m.path
       d="M4 12h16"
       variants={middleVariants}
       style={{ transformOrigin: "left center" }}
      />

      <m.path
       d="M4 18h16"
       variants={bottomVariants}
       style={{ transformOrigin: "left center" }}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MenuIcon.displayName = "MenuIcon";
export { MenuIcon };
