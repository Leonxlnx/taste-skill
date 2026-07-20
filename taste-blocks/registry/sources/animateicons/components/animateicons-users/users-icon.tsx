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
export interface UsersIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface UsersIconProps extends Omit<
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

const UsersIcon = forwardRef<UsersIconHandle, UsersIconProps>(
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

  const arcVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [50, 0],
    opacity: [0.3, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut" as const,
    },
   },
  };

  const headVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.6, 1.2, 1],
    opacity: [0, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeOut" as const,
    },
   },
  };

  const sideArcVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 0.8 },
   animate: {
    strokeDashoffset: [40, 0],
    opacity: [0.2, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut" as const,
     delay: 0.3,
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
      className="lucide lucide-users-icon lucide-users"
     >
      <m.path
       d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
       strokeDasharray="50"
       strokeDashoffset="50"
       variants={arcVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M16 3.128a4 4 0 0 1 0 7.744"
       strokeDasharray="40"
       strokeDashoffset="40"
       variants={sideArcVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M22 21v-2a4 4 0 0 0-3-3.87"
       strokeDasharray="40"
       strokeDashoffset="40"
       variants={sideArcVariants}
       initial="normal"
       animate={controls}
      />
      <m.circle
       cx="9"
       cy="7"
       r="4"
       variants={headVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

UsersIcon.displayName = "UsersIcon";
export { UsersIcon };
