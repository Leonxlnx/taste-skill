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
export interface PhoneIncomingIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface PhoneIncomingIconProps extends Omit<
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

const PhoneIncomingIcon = forwardRef<
 PhoneIncomingIconHandle,
 PhoneIncomingIconProps
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

  const phoneVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: [0, -8, 8, -6, 6, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
    },
   },
  };

  const arrowVariants: Variants = {
   normal: { x: 0, y: 0 },
   animate: {
    x: [0, -2, 0],
    y: [0, 2, 0],
    transition: {
     duration: 0.6 * duration,
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
      <m.path
       d="M16 2v6h6"
       variants={arrowVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="m22 2-6 6"
       variants={arrowVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
       variants={phoneVariants}
       initial="normal"
       animate={controls}
       style={{
        transformBox: "fill-box",
        transformOrigin: "center",
       }}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

PhoneIncomingIcon.displayName = "PhoneIncomingIcon";
export { PhoneIncomingIcon };
