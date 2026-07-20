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
export interface ScanQrCodeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ScanQrCodeIconProps extends Omit<
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

const ScanQrCodeIcon = forwardRef<ScanQrCodeIconHandle, ScanQrCodeIconProps>(
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

  const container: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.05, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
    },
   },
  };

  const scanBit = (delay: number): Variants => ({
   normal: { y: 0, opacity: 1 },
   animate: {
    y: [0, 2, 0],
    opacity: [1, 0.4, 1],
    transition: {
     duration: 0.35 * duration,
     ease: "easeOut",
     delay,
    },
   },
  });

  const core: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 0.85, 1],
    transition: {
     duration: 0.3 * duration,
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
      variants={container}
      initial="normal"
      animate={controls}
     >
      <m.path d="M17 12v4a1 1 0 0 1-1 1h-4" variants={scanBit(0)} />
      <m.path d="M17 3h2a2 2 0 0 1 2 2v2" variants={scanBit(0.05)} />
      <m.path d="M17 8V7" variants={scanBit(0.1)} />
      <m.path d="M21 17v2a2 2 0 0 1-2 2h-2" variants={scanBit(0.15)} />
      <m.path d="M3 7V5a2 2 0 0 1 2-2h2" variants={scanBit(0.2)} />
      <m.path d="M7 17h.01" variants={scanBit(0.25)} />
      <m.path d="M7 21H5a2 2 0 0 1-2-2v-2" variants={scanBit(0.3)} />

      <m.rect x="7" y="7" width="5" height="5" rx="1" variants={core} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ScanQrCodeIcon.displayName = "ScanQrCodeIcon";
export { ScanQrCodeIcon };
