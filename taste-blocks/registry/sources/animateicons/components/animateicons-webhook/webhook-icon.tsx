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
export interface WebhookIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface WebhookIconProps extends Omit<
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

const WebhookIcon = forwardRef<WebhookIconHandle, WebhookIconProps>(
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
     await controls.start("prime");
     await controls.start("emit");
     await controls.start("flow");
     await controls.start("settle");
    },
    stopAnimation: () => controls.start("normal"),
   };
  });

  const handleEnter = useCallback(
   async (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     await controls.start("prime");
     await controls.start("emit");
     await controls.start("flow");
     await controls.start("settle");
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

  const svgVariants: Variants = {
   normal: { scale: 1 },
   prime: {
    scale: 0.96,
    transition: {
     duration: 0.18 * duration,
     ease: [0.4, 0, 0.6, 1],
    },
   },
   emit: {
    scale: 1.04,
    transition: {
     duration: 0.22 * duration,
     ease: [0.34, 1.2, 0.64, 1],
    },
   },
   flow: { scale: 1 },
   settle: {
    scale: 1,
    transition: {
     duration: 0.3 * duration,
     ease: [0.33, 1, 0.68, 1],
    },
   },
  };

  const path = (delay = 0): Variants => ({
   normal: {
    strokeDasharray: "0 1",
    opacity: 1,
   },
   prime: {
    opacity: 0.6,
   },
   emit: {
    strokeDasharray: "16 6",
    transition: {
     duration: 0.35 * duration,
     ease: "easeOut",
    },
   },
   flow: {
    strokeDasharray: ["16 6", "0 1"],
    opacity: [1, 0.8, 1],
    transition: {
     delay,
     duration: 0.45 * duration,
     ease: "easeInOut",
    },
   },
   settle: {
    strokeDasharray: "0 1",
    opacity: 1,
    transition: {
     duration: 0.25 * duration,
    },
   },
  });

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
      variants={svgVariants}
      initial="normal"
      animate={controls}
     >
      <m.path
       d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"
       variants={path(0)}
      />
      <m.path
       d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"
       variants={path(0.08)}
      />
      <m.path
       d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"
       variants={path(0.16)}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

WebhookIcon.displayName = "WebhookIcon";
export { WebhookIcon };
