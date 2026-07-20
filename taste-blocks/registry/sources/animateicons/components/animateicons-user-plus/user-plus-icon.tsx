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
export interface UserPlusIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface UserPlusIconProps extends Omit<
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

const UserPlusIcon = forwardRef<UserPlusIconHandle, UserPlusIconProps>(
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

  const bodyVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [40, 0],
    opacity: [0.3, 1],
    transition: { duration: 0.6 * duration, ease: "easeInOut" },
   },
  };

  const headVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.5, 1.2, 1],
    opacity: [0, 1],
    transition: { duration: 0.6 * duration, ease: "easeInOut" },
   },
  };

  const plusVariants: Variants = {
   normal: { scale: 1, rotate: 0, opacity: 1 },
   animate: {
    scale: [1, 1.3, 1],
    rotate: [0, 25, -25, 0],
    opacity: 1,
    transition: { duration: 0.6 * duration, ease: "easeInOut" },
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
      className="lucide lucide-user-plus-icon lucide-user-plus"
     >
      <m.path
       d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
       strokeDasharray="40"
       strokeDashoffset="40"
       variants={bodyVariants}
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
      <m.g variants={plusVariants} initial="normal" animate={controls}>
       <m.line x1="19" x2="19" y1="8" y2="14" />
       <m.line x1="22" x2="16" y1="11" y2="11" />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

UserPlusIcon.displayName = "UserPlusIcon";
export { UserPlusIcon };
