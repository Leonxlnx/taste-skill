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
export interface UserLockIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface UserLockIconProps extends Omit<
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

const UserLockIcon = forwardRef<UserLockIconHandle, UserLockIconProps>(
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
  const headBodyVariants: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.4 * duration },
   },
  };

  const lockVariants: Variants = {
   normal: { x: 0, rotate: 0 },
   animate: {
    x: [0, -2, 2, -2, 2, 0],
    rotate: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.5 * duration },
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
      <m.circle
       cx="10"
       cy="7"
       r="4"
       variants={headBodyVariants}
       animate={controls}
       initial="normal"
      />
      <m.path
       d="M10.3 15H7a4 4 0 0 0-4 4v2"
       variants={headBodyVariants}
       animate={controls}
       initial="normal"
      />
      <m.path
       d="M15 15.5V14a2 2 0 0 1 4 0v1.5"
       variants={lockVariants}
       animate={controls}
       initial="normal"
      />
      <m.rect
       width="8"
       height="5"
       x="13"
       y="16"
       rx=".899"
       variants={lockVariants}
       animate={controls}
       initial="normal"
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

UserLockIcon.displayName = "UserLockIcon";
export { UserLockIcon };
