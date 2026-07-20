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
export interface CodeXmlIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface CodeXmlIconProps extends Omit<
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

const CodeXmlIcon = forwardRef<CodeXmlIconHandle, CodeXmlIconProps>(
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
  const leftControls = useAnimation();
  const rightControls = useAnimation();
  const slashControls = useAnimation();
  const isControlled = useRef(false);
  const reduced = useReducedMotion();

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      leftControls.start("normal");
      rightControls.start("normal");
      slashControls.start("normal");
     } else {
      leftControls.start("animate");
      rightControls.start("animate");
      slashControls.start("animate");
     }
    },
    stopAnimation: () => {
     leftControls.start("normal");
     rightControls.start("normal");
     slashControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     leftControls.start("animate");
     rightControls.start("animate");
     slashControls.start("animate");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [
    leftControls,
    rightControls,
    slashControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     leftControls.start("normal");
     rightControls.start("normal");
     slashControls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [leftControls, rightControls, slashControls, onMouseLeave],
  );

  const leftArrowVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    transition: { duration: 0.7 * duration, ease: "easeInOut" },
   },
  };

  const rightArrowVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0.6, 1],
    transition: { duration: 0.7 * duration, ease: "easeInOut", delay: 0.1 },
   },
  };

  const slashVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [1, 0, 1],
    opacity: [1, 0.4, 1],
    transition: {
     duration: 1 * duration,
     ease: "easeInOut",
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
     >
      <m.path
       d="m6 8-4 4 4 4"
       animate={leftControls}
       initial="normal"
       variants={leftArrowVariants}
      />
      <m.path
       d="m18 16 4-4-4-4"
       animate={rightControls}
       initial="normal"
       variants={rightArrowVariants}
      />
      <m.path
       d="m14.5 4-5 16"
       animate={slashControls}
       initial="normal"
       variants={slashVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

CodeXmlIcon.displayName = "CodeXmlIcon";
export { CodeXmlIcon };
