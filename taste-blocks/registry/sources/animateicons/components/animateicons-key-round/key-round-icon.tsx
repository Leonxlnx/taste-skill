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
export interface KeyRoundIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface KeyRoundIconProps extends Omit<
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

const KeyRoundIcon = forwardRef<KeyRoundIconHandle, KeyRoundIconProps>(
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

  const keyPathVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [140, 0],
    opacity: [0.4, 1],
    transition: {
     duration: 0.8 * duration,
     ease: "easeInOut" as const,
    },
   },
  };

  const headPulseVariants: Variants = {
   normal: { scale: 1, rotate: 0, originX: 16.5, originY: 7.5 },
   animate: {
    scale: [1, 1.12, 1],
    rotate: [0, -8, 8, 0],
    transition: {
     duration: 0.6 * duration,
     delay: 0.45,
     ease: "easeInOut" as const,
    },
   },
  };

  const biteNudgeVariants: Variants = {
   normal: { x: 0, y: 0 },
   animate: {
    x: [0, 1.2, 0],
    y: [0, -0.6, 0],
    transition: {
     duration: 0.45 * duration,
     delay: 0.55,
     ease: "easeInOut" as const,
    },
   },
  };

  const groupSway: Variants = {
   normal: { rotate: 0, scale: 1 },
   animate: {
    rotate: [0, -2, 2, 0],
    scale: [1, 1.02, 1],
    transition: {
     duration: 0.7 * duration,
     ease: "easeInOut" as const,
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
      className="lucide lucide-key-round-icon lucide-key-round"
     >
      <m.g variants={groupSway} initial="normal" animate={controls}>
       <m.path
        d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
        strokeDasharray="140"
        strokeDashoffset="140"
        variants={keyPathVariants}
        initial="normal"
        animate={controls}
       />
       <m.g variants={biteNudgeVariants} initial="normal" animate={controls}>
        <m.path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172" />
       </m.g>
       <m.circle
        cx="16.5"
        cy="7.5"
        r=".5"
        fill="currentColor"
        variants={headPulseVariants}
        initial="normal"
        animate={controls}
       />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

KeyRoundIcon.displayName = "KeyRoundIcon";
export { KeyRoundIcon };
