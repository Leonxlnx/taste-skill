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
export interface TriangleAlertIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface TriangleAlertIconProps extends Omit<
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

const TriangleAlertIcon = forwardRef<
 TriangleAlertIconHandle,
 TriangleAlertIconProps
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
    if (!isControlled.current) {
     controls.start("animate");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [controls, reduced, isAnimated, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [controls, onMouseLeave],
  );

  const svgVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: [0, 3, -8, 7, -5, 3, 0],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
     times: [0, 0.1, 0.28, 0.46, 0.64, 0.82, 1],
    },
   },
  };

  const triangleVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 1.06, 1],
    opacity: [0.6, 1, 1],
    transition: {
     duration: 1 * duration,
     ease: "easeOut",
     times: [0, 0.3, 1],
    },
   },
  };

  const lineVariants: Variants = {
   normal: { scaleY: 1, opacity: 1 },
   animate: {
    scaleY: [0.3, 1.2, 0.96, 1],
    opacity: [0, 1, 1, 1],
    transition: {
     duration: 0.8 * duration,
     ease: [0.34, 1.4, 0.64, 1],
     delay: 0.16 * duration,
    },
   },
  };

  const dotVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0, 1.6, 1],
    opacity: [0, 1, 1],
    transition: {
     duration: 0.8 * duration,
     ease: [0.34, 1.4, 0.64, 1],
     delay: 0.3 * duration,
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={controls}
      initial="normal"
      variants={svgVariants}
     >
      <m.path
       d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
       variants={triangleVariants}
      />
      <m.path
       d="M12 9v4"
       variants={lineVariants}
       style={{ transformOrigin: "12px 13px" }}
      />
      <m.path d="M12 17h.01" variants={dotVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

TriangleAlertIcon.displayName = "TriangleAlertIcon";
export { TriangleAlertIcon };
