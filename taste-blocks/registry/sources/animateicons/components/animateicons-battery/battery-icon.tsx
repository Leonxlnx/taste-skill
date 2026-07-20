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
export interface BatteryIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BatteryIconProps extends Omit<
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

const BatteryIcon = forwardRef<BatteryIconHandle, BatteryIconProps>(
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
  const svgControls = useAnimation();
  const rectControls = useAnimation();
  const tipControls = useAnimation();

  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      svgControls.start("normal");
      rectControls.start("normal");
      tipControls.start("normal");
     } else {
      svgControls.start("warning");
      rectControls.start("warning");
      tipControls.start("warning");
     }
    },
    stopAnimation: () => {
     svgControls.start("normal");
     rectControls.start("normal");
     tipControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     svgControls.start("warning");
     rectControls.start("warning");
     tipControls.start("warning");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [svgControls, rectControls, tipControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     svgControls.start("normal");
     rectControls.start("normal");
     tipControls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [svgControls, rectControls, tipControls, onMouseLeave],
  );

  const svgVariants: Variants = {
   normal: {
    scale: 1,
    rotate: 0,
   },
   warning: {
    scale: [1, 1.05, 1],
    rotate: [0, -2, 2, 0],
    transition: {
     duration: 0.45 * duration,
     ease: "easeInOut",
    },
   },
  };

  const rectVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
   },
   warning: {
    pathLength: [0.3, 1],
    opacity: [0.4, 1],
    transition: {
     duration: 0.6 * duration,
     ease: "easeInOut",
    },
   },
  };

  const tipVariants: Variants = {
   normal: {
    opacity: 1,
    scale: 1,
   },
   warning: {
    opacity: [1, 0.2, 1],
    scale: [1, 1.4, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeInOut",
     repeat: Infinity,
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
      animate={svgControls}
      initial="normal"
      variants={svgVariants}
     >
      <m.path
       d="M22 14L22 10"
       animate={tipControls}
       initial="normal"
       variants={tipVariants}
      />
      <m.rect
       x="2"
       y="6"
       width="16"
       height="12"
       rx="2"
       animate={rectControls}
       initial="normal"
       variants={rectVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BatteryIcon.displayName = "BatteryIcon";
export { BatteryIcon };
