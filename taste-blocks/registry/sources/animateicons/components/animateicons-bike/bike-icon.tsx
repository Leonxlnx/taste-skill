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
export interface BikeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BikeIconProps extends Omit<
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

const BikeIcon = forwardRef<BikeIconHandle, BikeIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 1.4,
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

  const bikeVariants: Variants = {
   normal: { x: 0 },
   animate: {
    x: [0, 40, -40, 0],
    transition: {
     duration,
     ease: "easeInOut",
     times: [0, 0.4, 0.401, 1],
    },
   },
  };

  const wheelVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: 720,
    transition: {
     duration,
     ease: "linear",
    },
   },
  };

  const frontWheelVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: 720,
    transition: {
     duration,
     ease: "linear",
     delay: 0.06,
    },
   },
  };

  const pedalVariants: Variants = {
   normal: { rotate: 0 },
   animate: {
    rotate: 720,
    transition: {
     duration,
     ease: "linear",
    },
   },
  };

  return (
   <LazyMotion features={domMin} strict>
    <m.div
     className={cn(
      "inline-flex items-center justify-center overflow-hidden",
      className,
     )}
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
      variants={bikeVariants}
     >
      <m.g
       variants={wheelVariants}
       style={{ transformOrigin: "5.5px 17.5px" }}
       initial="normal"
       animate={controls}
      >
       <circle cx="5.5" cy="17.5" r="3.5" />
      </m.g>

      <m.g
       variants={frontWheelVariants}
       style={{ transformOrigin: "18.5px 17.5px" }}
       initial="normal"
       animate={controls}
      >
       <circle cx="18.5" cy="17.5" r="3.5" />
      </m.g>

      <m.g
       variants={pedalVariants}
       style={{ transformOrigin: "12px 14px" }}
       initial="normal"
       animate={controls}
      >
       <circle cx="12" cy="14" r="0.8" />
      </m.g>

      <circle cx="15" cy="5" r="1" />

      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BikeIcon.displayName = "BikeIcon";
export { BikeIcon };
