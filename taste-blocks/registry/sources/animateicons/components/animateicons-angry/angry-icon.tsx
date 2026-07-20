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
export interface AngryIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface AngryIconProps extends Omit<
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

const AngryIcon = forwardRef<AngryIconHandle, AngryIconProps>(
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
    startAnimation: async () => {
     if (!isAnimated || reduced) {
      controls.start("normal");
      return;
     }
     await controls.start("tense");
     await controls.start("shake");
     await controls.start("flash");
     await controls.start("calm");
    },
    stopAnimation: () => controls.start("normal"),
   };
  });

  const handleEnter = useCallback(
   async (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     await controls.start("tense");
     await controls.start("shake");
     await controls.start("flash");
     await controls.start("calm");
    } else onMouseEnter?.(e as any);
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

  const container: Variants = {
   normal: { rotate: 0, scale: 1 },
   tense: {
    scale: 0.95,
    transition: {
     duration: 0.2 * duration,
     ease: [0.4, 0, 0.6, 1],
    },
   },
   shake: {
    rotate: [0, -4, 4, -3, 3, -2, 2, 0],
    scale: 1,
    transition: {
     duration: 0.5 * duration,
     ease: "linear",
    },
   },
   flash: {
    scale: [1, 1.1, 1],
    transition: {
     duration: 0.3 * duration,
     ease: [0.34, 1.56, 0.64, 1],
    },
   },
   calm: {
    rotate: 0,
    scale: 1,
    transition: {
     duration: 0.4 * duration,
     ease: [0.33, 1, 0.68, 1],
    },
   },
  };

  const face: Variants = {
   normal: { scale: 1 },
   tense: {
    scale: 0.98,
    transition: {
     duration: 0.2 * duration,
    },
   },
   shake: {
    scale: 1,
   },
   flash: {
    scale: [1, 1.02, 1],
    transition: {
     duration: 0.3 * duration,
    },
   },
   calm: {
    scale: 1,
   },
  };

  const brow = (side: "left" | "right"): Variants => {
   const x = side === "left" ? -0.5 : 0.5;
   const rotation = side === "left" ? 5 : -5;

   return {
    normal: { x: 0, y: 0, rotate: 0 },
    tense: {
     y: -0.3,
     rotate: rotation * 1.5,
     transition: {
      duration: 0.2 * duration,
      ease: "easeOut",
     },
    },
    shake: {
     x: [0, x, -x, x, 0],
     transition: {
      duration: 0.5 * duration,
     },
    },
    flash: {
     y: -0.5,
     rotate: rotation * 2,
     transition: {
      duration: 0.15 * duration,
     },
    },
    calm: {
     x: 0,
     y: 0,
     rotate: 0,
     transition: {
      duration: 0.4 * duration,
      ease: [0.33, 1, 0.68, 1],
     },
    },
   };
  };

  const eye: Variants = {
   normal: { scaleY: 1 },
   tense: {
    scaleY: 0.6,
    transition: {
     duration: 0.2 * duration,
     ease: "easeOut",
    },
   },
   shake: {
    scaleY: [0.6, 0.5, 0.6],
   },
   flash: {
    scaleY: [0.6, 0.3, 0.6],
    transition: {
     duration: 0.3 * duration,
    },
   },
   calm: {
    scaleY: 1,
    transition: {
     duration: 0.4 * duration,
     ease: [0.33, 1, 0.68, 1],
    },
   },
  };

  const mouth: Variants = {
   normal: { scaleX: 1, y: 0 },
   tense: {
    scaleX: 0.9,
    y: -0.5,
    transition: {
     duration: 0.2 * duration,
     ease: "easeOut",
    },
   },
   shake: {
    y: [0, -0.3, 0],
   },
   flash: {
    scaleX: 0.8,
    y: -0.8,
    transition: {
     duration: 0.15 * duration,
    },
   },
   calm: {
    scaleX: 1,
    y: 0,
    transition: {
     duration: 0.4 * duration,
     ease: [0.33, 1, 0.68, 1],
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
      variants={container}
      initial="normal"
      animate={controls}
     >
      <m.circle cx="12" cy="12" r="10" variants={face} />

      <m.path d="M7.5 8 10 9" variants={brow("left")} />
      <m.path d="m14 9 2.5-1" variants={brow("right")} />

      <m.path d="M9 10h.01" variants={eye} />
      <m.path d="M15 10h.01" variants={eye} />

      <m.path d="M16 16s-1.5-2-4-2-4 2-4 2" variants={mouth} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

AngryIcon.displayName = "AngryIcon";
export { AngryIcon };
