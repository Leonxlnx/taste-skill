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
export interface ExternalLinkIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ExternalLinkIconProps extends Omit<
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

const ExternalLinkIcon = forwardRef<
 ExternalLinkIconHandle,
 ExternalLinkIconProps
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
  const boxControls = useAnimation();
  const arrowControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      boxControls.start("normal");
      arrowControls.start("normal");
     } else {
      boxControls.start("animate");
      arrowControls.start("animate");
     }
    },
    stopAnimation: () => {
     boxControls.start("normal");
     arrowControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     boxControls.start("animate");
     arrowControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [boxControls, arrowControls],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     boxControls.start("normal");
     arrowControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [boxControls, arrowControls],
  );

  const boxVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.4, 1],
    transition: { duration: 0.9 * duration, ease: [0.16, 1, 0.3, 1] },
   },
  };

  const arrowVariants: Variants = {
   normal: { x: 0, y: 0, opacity: 1 },
   animate: {
    x: [0, -1, 2, 0],
    y: [0, 1, -2, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     times: [0, 0.15, 0.55, 1],
     delay: 0.12 * duration,
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
      <m.path
       d="M15 3h6v6"
       variants={arrowVariants}
       initial="normal"
       animate={arrowControls}
      />
      <m.path
       d="M10 14 21 3"
       variants={arrowVariants}
       initial="normal"
       animate={arrowControls}
      />
      <m.path
       d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
       variants={boxVariants}
       initial="normal"
       animate={boxControls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ExternalLinkIcon.displayName = "ExternalLinkIcon";
export { ExternalLinkIcon };
