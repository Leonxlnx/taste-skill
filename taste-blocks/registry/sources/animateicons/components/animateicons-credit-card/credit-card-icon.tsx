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
export interface CreditCardIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CreditCardIconProps extends Omit<
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

const CreditCardIcon = forwardRef<CreditCardIconHandle, CreditCardIconProps>(
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
  const stripeControls = useAnimation();
  const swipeControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      controls.start("normal");
      stripeControls.start("normal");
      swipeControls.start("normal");
     } else {
      controls.start("animate");
      stripeControls.start("animate");
      swipeControls.start("animate");
     }
    },
    stopAnimation: () => {
     controls.start("normal");
     stripeControls.start("normal");
     swipeControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     controls.start("animate");
     stripeControls.start("animate");
     swipeControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [controls, stripeControls, swipeControls, reduced, isAnimated, onMouseLeave],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
     stripeControls.start("normal");
     swipeControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [controls, stripeControls, swipeControls],
  );

  const cardTilt: Variants = {
   normal: { rotate: 0, scale: 1, x: 0, y: 0 },
   animate: {
    rotate: [0, -4, 2, 0],
    scale: [1, 1.02, 1],
    x: [0, -0.4, 0],
    y: [0, -0.3, 0],
    transition: { duration: 0.6 * duration, ease: "easeInOut" },
   },
  };

  const stripeSlide: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [-2, 0],
    opacity: [0.7, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
     delay: 0.08,
    },
   },
  };

  const swipeLine: Variants = {
   normal: { pathLength: 0, opacity: 0 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1, 0.9],
    transition: {
     duration: 0.5 * duration,
     ease: "easeInOut",
     delay: 0.18,
    },
   },
  };

  const embossPulse: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.035, 1],
    transition: {
     duration: 0.28 * duration,
     ease: "easeOut",
     delay: 0.3,
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
      className="lucide lucide-credit-card-icon lucide-credit-card"
     >
      <m.g variants={cardTilt} initial="normal" animate={controls}>
       <m.rect
        width="20"
        height="14"
        x="2"
        y="5"
        rx="2"
        variants={embossPulse}
        initial="normal"
        animate={controls}
       />
       <m.line
        x1="2"
        x2="22"
        y1="10"
        y2="10"
        variants={stripeSlide}
        initial="normal"
        animate={stripeControls}
       />
       <m.path
        d="M5 15 H15"
        stroke="currentColor"
        strokeWidth="2"
        variants={swipeLine}
        initial="normal"
        animate={swipeControls}
       />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CreditCardIcon.displayName = "CreditCardIcon";
export { CreditCardIcon };
