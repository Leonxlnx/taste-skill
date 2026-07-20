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
export interface WalletIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface WalletIconProps extends Omit<
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

const WalletIcon = forwardRef<WalletIconHandle, WalletIconProps>(
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
    strokeDashoffset: [80, 0],
    opacity: [0.4, 1],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut" as const,
    },
   },
  };

  const flapVariants: Variants = {
   normal: { rotate: 0, originX: 0.1, originY: 0.5 },
   animate: {
    rotate: [-6, 0, -3, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut" as const,
     delay: 0.2,
    },
   },
  };

  const swipeVariants: Variants = {
   normal: { x: 0, opacity: 0 },
   animate: {
    x: [0, 6, 0],
    opacity: [0, 1, 0],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut" as const,
     delay: 0.45,
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
      className="lucide lucide-wallet-icon lucide-wallet"
     >
      <m.path
       d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"
       strokeDasharray="80"
       strokeDashoffset="80"
       variants={bodyVariants}
       initial="normal"
       animate={controls}
      />
      <m.g variants={flapVariants} initial="normal" animate={controls}>
       <m.path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      </m.g>
      <m.line
       x1="14"
       y1="12"
       x2="18"
       y2="12"
       variants={swipeVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

WalletIcon.displayName = "WalletIcon";
export { WalletIcon };
