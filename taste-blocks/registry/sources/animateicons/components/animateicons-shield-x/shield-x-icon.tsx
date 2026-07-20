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
export interface ShieldXIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ShieldXIconProps extends Omit<
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

const ShieldXIcon = forwardRef<ShieldXIconHandle, ShieldXIconProps>(
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
  const shieldControls = useAnimation();
  const x1Controls = useAnimation();
  const x2Controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      shieldControls.start("normal");
      x1Controls.start("normal");
      x2Controls.start("normal");
     } else {
      shieldControls.start("animate");
      x1Controls.start("animate");
      x2Controls.start("animate");
     }
    },
    stopAnimation: () => {
     shieldControls.start("normal");
     x1Controls.start("normal");
     x2Controls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     shieldControls.start("animate");
     x1Controls.start("animate");
     x2Controls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [shieldControls, x1Controls, x2Controls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     shieldControls.start("normal");
     x1Controls.start("normal");
     x2Controls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [shieldControls, x1Controls, x2Controls, onMouseLeave],
  );

  const shieldVariants: Variants = {
   normal: { strokeDashoffset: 0, scale: 1, rotate: 0 },
   animate: {
    strokeDashoffset: [300, 24, 0],
    scale: [1, 0.98, 1.04, 1],
    rotate: [0, -2, 1, 0],
    transition: {
     duration: 1.0 * duration,
     ease: [0.18, 0.85, 0.25, 1],
     times: [0, 0.35, 0.75, 1],
    },
   },
  };

  const x1Variants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [40, 0],
    opacity: [0, 1],
    transition: {
     duration: 0.5 * duration,
     ease: [0.22, 0.9, 0.28, 1],
     delay: 0.28,
    },
   },
  };

  const x2Variants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [40, 0],
    opacity: [0, 1],
    transition: {
     duration: 0.5 * duration,
     ease: [0.22, 0.9, 0.28, 1],
     delay: 0.36,
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
       d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
       initial="normal"
       animate={shieldControls}
       variants={shieldVariants}
       style={{ strokeDasharray: 300, transformOrigin: "12px 12px" }}
      />
      <m.path
       d="m14.5 9.5-5 5"
       initial="normal"
       animate={x1Controls}
       variants={x1Variants}
       style={{ strokeDasharray: 40, strokeLinecap: "round" }}
      />
      <m.path
       d="m9.5 9.5 5 5"
       initial="normal"
       animate={x2Controls}
       variants={x2Variants}
       style={{ strokeDasharray: 40, strokeLinecap: "round" }}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ShieldXIcon.displayName = "ShieldXIcon";
export { ShieldXIcon };
