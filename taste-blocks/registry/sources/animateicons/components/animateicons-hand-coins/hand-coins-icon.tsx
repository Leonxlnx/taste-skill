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
export interface HandCoinsIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface HandCoinsIconProps extends Omit<
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

const HandCoinsIcon = forwardRef<HandCoinsIconHandle, HandCoinsIconProps>(
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
  const groupControls = useAnimation();
  const coinsControls = useAnimation();
  const handControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      groupControls.start("normal");
      coinsControls.start("normal");
      handControls.start("normal");
     } else {
      groupControls.start("animate");
      coinsControls.start("animate");
      handControls.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     coinsControls.start("normal");
     handControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     groupControls.start("animate");
     coinsControls.start("animate");
     handControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    coinsControls,
    handControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     groupControls.start("normal");
     coinsControls.start("normal");
     handControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [groupControls, coinsControls, handControls, onMouseLeave],
  );

  const groupVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.06, 0.98, 1],
    rotate: [0, -2, 1, 0],
    transition: {
     duration: 0.9 * duration,
     ease: [0.22, 1, 0.36, 1],
    },
   },
  };

  const coinsVariants: Variants = {
   normal: { scale: 1, opacity: 1, y: 0 },
   animate: {
    scale: [0.7, 1.02, 1],
    opacity: [0, 1, 1],
    y: [-6, 0],
    transition: {
     duration: 0.6 * duration,
     ease: "easeOut",
     delay: 0.1,
    },
   },
  };

  const handVariants: Variants = {
   normal: { pathLength: 1, opacity: 1, y: 0 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.5, 1],
    y: [2, 0],
    transition: {
     duration: 0.9 * duration,
     ease: "easeInOut",
     delay: 0.2,
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
      initial="normal"
      animate={groupControls}
      variants={groupVariants}
     >
      <m.path
       d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"
       initial="normal"
       animate={handControls}
       variants={handVariants}
      />
      <m.path
       d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"
       initial="normal"
       animate={handControls}
       variants={handVariants}
      />
      <m.path
       d="m2 16 6 6"
       initial="normal"
       animate={handControls}
       variants={handVariants}
      />
      <m.circle
       cx="16"
       cy="9"
       r="2.9"
       initial="normal"
       animate={coinsControls}
       variants={coinsVariants}
      />
      <m.circle
       cx="6"
       cy="5"
       r="3"
       initial="normal"
       animate={coinsControls}
       variants={coinsVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

HandCoinsIcon.displayName = "HandCoinsIcon";
export { HandCoinsIcon };
