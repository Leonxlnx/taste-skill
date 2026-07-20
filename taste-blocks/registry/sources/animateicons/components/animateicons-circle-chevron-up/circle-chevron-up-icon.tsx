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
export interface CircleChevronUpIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CircleChevronUpIconProps extends Omit<
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

const CircleChevronUpIcon = forwardRef<
 CircleChevronUpIconHandle,
 CircleChevronUpIconProps
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
  const circleControls = useAnimation();
  const arrowControls = useAnimation();
  const isControlled = useRef(false);
  const tickControls = useAnimation();
  const reduced = useReducedMotion();

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      circleControls.start("normal");
      tickControls.start("normal");
      arrowControls.start("normal");
     } else {
      circleControls.start("animate");
      tickControls.start("animate");
      arrowControls.start("animate");
     }
    },
    stopAnimation: () => {
     circleControls.start("normal");
     tickControls.start("normal");
     arrowControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     circleControls.start("animate");
     tickControls.start("animate");
     arrowControls.start("animate");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [circleControls, tickControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     circleControls.start("normal");
     tickControls.start("normal");
     arrowControls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [circleControls, tickControls, onMouseLeave],
  );
  const circleVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.1, 0.9, 1.05, 1],
    opacity: 1,
    transition: {
     duration: 1.2 * duration,
     ease: "easeInOut",
    },
   },
  };

  const arrowVariants: Variants = {
   normal: { y: 0, opacity: 1 },
   animate: {
    y: [10, 0],
    opacity: [0, 1],
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
      <m.circle
       cx="12"
       cy="12"
       r="10"
       animate={circleControls}
       initial="normal"
       variants={circleVariants}
      />
      <m.path
       d="m8 14 4-4 4 4"
       animate={arrowControls}
       initial="normal"
       variants={arrowVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CircleChevronUpIcon.displayName = "CircleChevronUpIcon";
export { CircleChevronUpIcon };
