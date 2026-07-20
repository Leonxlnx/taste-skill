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
export interface CircleCheckBigIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CircleCheckBigIconProps extends Omit<
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

const CircleCheckBigIcon = forwardRef<
 CircleCheckBigIconHandle,
 CircleCheckBigIconProps
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
  const tickControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      controls.start("normal");
      tickControls.start("normal");
     } else {
      controls.start("animate");
      tickControls.start("animate");
     }
    },
    stopAnimation: () => {
     controls.start("normal");
     tickControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     controls.start("animate");
     tickControls.start("animate");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [controls, tickControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
     tickControls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [controls, tickControls, onMouseLeave],
  );

  const svgVariants: Variants = {
   normal: {
    scale: 1,
   },
   animate: {
    scale: [1, 1.12, 0.96, 1],
    transition: {
     duration: 0.45 * duration,
     ease: "easeOut",
    },
   },
  };

  const circleVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    pathLength: [0.7, 1],
    opacity: [0.7, 1],
    transition: {
     duration: 0.35 * duration,
     ease: "easeOut",
    },
   },
  };

  const tickVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    pathLength: [0, 1],
    opacity: 1,
    transition: {
     duration: 0.3 * duration,
     delay: 0.12 * duration,
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
      animate={controls}
      initial="normal"
      variants={svgVariants}
     >
      <m.path
       d="M21.801 10A10 10 0 1 1 17 3.335"
       variants={circleVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="m9 11 3 3L22 4"
       variants={tickVariants}
       initial="normal"
       animate={tickControls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CircleCheckBigIcon.displayName = "CircleCheckBigIcon";
export { CircleCheckBigIcon };
