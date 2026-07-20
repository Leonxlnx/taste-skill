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
export interface AArrowUpIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface AArrowUpIconProps extends Omit<
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

const AArrowUpIcon = forwardRef<AArrowUpIconHandle, AArrowUpIconProps>(
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
  const headControls = useAnimation();
  const stemControls = useAnimation();
  const diagControls = useAnimation();
  const barControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      groupControls.start("normal");
      headControls.start("normal");
      stemControls.start("normal");
      diagControls.start("normal");
      barControls.start("normal");
     } else {
      groupControls.start("animate");
      headControls.start("animate");
      stemControls.start("animate");
      diagControls.start("animate");
      barControls.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     headControls.start("normal");
     stemControls.start("normal");
     diagControls.start("normal");
     barControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     groupControls.start("animate");
     headControls.start("animate");
     stemControls.start("animate");
     diagControls.start("animate");
     barControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    headControls,
    stemControls,
    diagControls,
    barControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     groupControls.start("normal");
     headControls.start("normal");
     stemControls.start("normal");
     diagControls.start("normal");
     barControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [
    groupControls,
    headControls,
    stemControls,
    diagControls,
    barControls,
    onMouseLeave,
   ],
  );

  const groupVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.06, 0.98, 1],
    rotate: [0, -1.5, 1, 0],
    transition: {
     duration: 0.85 * duration,
     ease: [0.22, 0.9, 0.32, 1],
    },
   },
  };

  const headVariants: Variants = {
   normal: { pathLength: 1, scale: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    scale: [1, 1.12, 1],
    opacity: [0.6, 1, 1],
    transition: {
     duration: 0.9 * duration,
     ease: "easeOut",
     delay: 0.06,
    },
   },
  };

  const stemVariants: Variants = {
   normal: { pathLength: 1, opacity: 1, y: 0 },
   animate: {
    pathLength: [0, 1],
    y: [6, 0],
    opacity: [0, 1],
    transition: {
     duration: 0.8 * duration,
     ease: "easeOut",
     delay: 0.12,
    },
   },
  };

  const diagVariants: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [8, 0],
    opacity: [0, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeOut",
     delay: 0.02,
    },
   },
  };

  const barVariants: Variants = {
   normal: { pathLength: 1, opacity: 1, scaleX: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    scaleX: [0.9, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut",
     delay: 0.18,
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
       d="m14 11 4-4 4 4"
       initial="normal"
       animate={headControls}
       variants={headVariants}
      />
      <m.path
       d="M18 16V7"
       initial="normal"
       animate={stemControls}
       variants={stemVariants}
      />
      <m.path
       d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"
       initial="normal"
       animate={diagControls}
       variants={diagVariants}
      />
      <m.path
       d="M3.304 13h6.392"
       initial="normal"
       animate={barControls}
       variants={barVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

AArrowUpIcon.displayName = "AArrowUpIcon";
export { AArrowUpIcon };
