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
export interface TelescopeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface TelescopeIconProps extends Omit<
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

const TelescopeIcon = forwardRef<TelescopeIconHandle, TelescopeIconProps>(
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
  const groupControls = useAnimation();
  const tubeControls = useAnimation();
  const lensControls = useAnimation();
  const legsControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      groupControls.start("normal");
      tubeControls.start("normal");
      lensControls.start("normal");
      legsControls.start("normal");
     } else {
      groupControls.start("animate");
      tubeControls.start("animate");
      lensControls.start("animate");
      legsControls.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     tubeControls.start("normal");
     lensControls.start("normal");
     legsControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     groupControls.start("animate");
     tubeControls.start("animate");
     lensControls.start("animate");
     legsControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    tubeControls,
    lensControls,
    legsControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     groupControls.start("normal");
     tubeControls.start("normal");
     lensControls.start("normal");
     legsControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [groupControls, tubeControls, lensControls, legsControls, onMouseLeave],
  );

  const iconVariants: Variants = {
   normal: { scale: 1, rotate: 0, y: 0 },
   animate: {
    scale: [1, 1.06, 0.98, 1],
    rotate: [0, -2, 1.5, 0],
    y: [0, -1, 0.5, 0],
    transition: { duration: 0.9 * duration, ease: "easeInOut" },
   },
  };

  const tubeVariants: Variants = {
   normal: { x: 0, rotate: 0, opacity: 1 },
   animate: {
    x: [0, 1.5, 0],
    rotate: [0, -3, 0],
    opacity: 1,
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     delay: 0.05,
    },
   },
  };

  const smallBarVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.8, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
     delay: 0.15,
    },
   },
  };

  const legsVariants: Variants = {
   normal: { scaleY: 1, y: 0, transformOrigin: "50% 100%" },
   animate: {
    scaleY: [1, 1.04, 1],
    y: [0, -0.6, 0],
    transition: { duration: 0.6 * duration, ease: "easeOut", delay: 0.2 },
   },
  };

  const lensVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.95, 1],
    transition: { duration: 0.55 * duration, ease: "easeOut", delay: 0.25 },
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
      initial="normal"
      animate={groupControls}
      variants={iconVariants}
     >
      <m.path
       d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"
       initial="normal"
       animate={tubeControls}
       variants={tubeVariants}
      />
      <m.path
       d="m13.56 11.747 4.332-.924"
       initial="normal"
       animate={tubeControls}
       variants={smallBarVariants}
      />
      <m.path
       d="m16 21-3.105-6.21"
       initial="normal"
       animate={legsControls}
       variants={legsVariants}
      />
      <m.path
       d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"
       initial="normal"
       animate={tubeControls}
       variants={tubeVariants}
      />
      <m.path
       d="m6.158 8.633 1.114 4.456"
       initial="normal"
       animate={legsControls}
       variants={legsVariants}
      />
      <m.path
       d="m8 21 3.105-6.21"
       initial="normal"
       animate={legsControls}
       variants={legsVariants}
      />
      <m.circle
       cx="12"
       cy="13"
       r="2"
       initial="normal"
       animate={lensControls}
       variants={lensVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

TelescopeIcon.displayName = "TelescopeIcon";
export { TelescopeIcon };
