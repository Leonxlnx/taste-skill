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
export interface GitForkIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GitForkIconProps extends Omit<
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

const GitForkIcon = forwardRef<GitForkIconHandle, GitForkIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.8,
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
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) controls.start("normal");
    else onMouseLeave?.(e);
   },
   [controls, onMouseLeave],
  );

  const ease: [number, number, number, number] = [0.25, 1, 0.5, 1];

  const bottomNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: { duration: duration * 0.3, ease },
   },
  };

  const trunk: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.45,
     ease,
     delay: duration * 0.15,
    },
   },
  };

  const branch: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
     duration: duration * 0.4,
     ease,
     delay: duration * 0.4,
    },
   },
  };

  const leftNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.25,
     ease,
     delay: duration * 0.65,
    },
   },
  };

  const rightNode: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.7, 1.1, 1],
    opacity: [0, 1],
    transition: {
     duration: duration * 0.25,
     ease,
     delay: duration * 0.65,
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
      <m.circle
       cx="12"
       cy="18"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={bottomNode}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M12 12v3"
       variants={trunk}
       initial="normal"
       animate={controls}
      />

      <m.path
       d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"
       variants={branch}
       initial="normal"
       animate={controls}
      />

      <m.circle
       cx="6"
       cy="6"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={leftNode}
       initial="normal"
       animate={controls}
      />

      <m.circle
       cx="18"
       cy="6"
       r="3"
       style={{ transformOrigin: "center" }}
       variants={rightNode}
       initial="normal"
       animate={controls}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GitForkIcon.displayName = "GitForkIcon";

export { GitForkIcon };
