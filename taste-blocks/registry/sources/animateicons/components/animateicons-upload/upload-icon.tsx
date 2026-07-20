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
export interface UploadIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface UploadIconProps extends Omit<
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

const UploadIcon = forwardRef<UploadIconHandle, UploadIconProps>(
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

  const shaftVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [30, 0],
    opacity: [0.4, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut" as const,
    },
   },
  };

  const headVariants: Variants = {
   normal: { y: 0, opacity: 1, scale: 1 },
   animate: {
    y: [2, -2, 0],
    scale: [1, 1.05, 1],
    opacity: [0.6, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut" as const,
     delay: 0.05,
    },
   },
  };

  const trayVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [60, 0],
    opacity: [0.3, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut" as const,
     delay: 0.1,
    },
   },
  };

  const groupPulse: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.02, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut" as const,
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
      className="lucide lucide-upload-icon lucide-upload"
     >
      <m.g variants={groupPulse} initial="normal" animate={controls}>
       <m.path
        d="M12 3v12"
        strokeDasharray="30"
        strokeDashoffset="30"
        variants={shaftVariants}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="m17 8-5-5-5 5"
        variants={headVariants}
        initial="normal"
        animate={controls}
       />
       <m.path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        strokeDasharray="60"
        strokeDashoffset="60"
        variants={trayVariants}
        initial="normal"
        animate={controls}
       />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

UploadIcon.displayName = "UploadIcon";
export { UploadIcon };
