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
export interface ClipboardIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ClipboardIconProps extends Omit<
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

const ClipboardIcon = forwardRef<ClipboardIconHandle, ClipboardIconProps>(
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
  const bodyControls = useAnimation();
  const clipControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      bodyControls.start("normal");
      clipControls.start("normal");
     } else {
      bodyControls.start("animate");
      clipControls.start("animate");
     }
    },
    stopAnimation: () => {
     bodyControls.start("normal");
     clipControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     bodyControls.start("animate");
     clipControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [bodyControls, clipControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     bodyControls.start("normal");
     clipControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [bodyControls, clipControls, onMouseLeave],
  );

  const bodyVariants: Variants = {
   normal: { strokeDashoffset: 0, y: 0 },

   animate: {
    strokeDashoffset: [240, 0],
    transition: { duration: 1 * duration, ease: "easeInOut" },
    y: [0, -2, 0],
   },
  };

  const clipVariants: Variants = {
   normal: { strokeDashoffset: 0, y: 0 },
   animate: {
    strokeDashoffset: [60, 0],
    transition: { duration: 1 * duration, ease: "easeInOut", delay: 0.2 },
    y: [0, -2, 0],
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
      <m.rect
       x="8"
       y="2"
       width="8"
       height="4"
       rx="1"
       ry="1"
       initial="normal"
       animate={clipControls}
       variants={clipVariants}
       style={{ strokeDasharray: 60, strokeLinecap: "round" }}
      />
      <m.path
       d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
       initial="normal"
       animate={bodyControls}
       variants={bodyVariants}
       style={{ strokeDasharray: 240, strokeLinecap: "round" }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ClipboardIcon.displayName = "ClipboardIcon";
export { ClipboardIcon };
