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
export interface BoxesIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BoxesIconProps extends Omit<
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

const BoxesIcon = forwardRef<BoxesIconHandle, BoxesIconProps>(
 (
  {
   onMouseEnter,
   onMouseLeave,
   className,
   size = 24,
   duration = 0.6,
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

  const iconVariants: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.04, 1],
    transition: {
     duration,
     ease: [0.22, 1, 0.36, 1],
    },
   },
  };

  const groupVariants: Variants = {
   normal: { y: 0 },
   animate: (i: number) => ({
    y: [0, -2 - i, 0],
    transition: {
     duration: duration * 0.9,
     delay: i * 0.08,
     ease: [0.22, 1, 0.36, 1],
    },
   }),
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
      animate={controls}
      initial="normal"
      variants={iconVariants}
     >
      <m.g
       variants={groupVariants}
       custom={2}
       animate={controls}
       initial="normal"
      >
       <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
       <path d="m7 16.5-4.74-2.85" />
       <path d="m7 16.5 5-3" />
       <path d="M7 16.5v5.17" />
      </m.g>

      <m.g
       variants={groupVariants}
       custom={1}
       animate={controls}
       initial="normal"
      >
       <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
       <path d="m17 16.5-5-3" />
       <path d="m17 16.5 4.74-2.85" />
       <path d="M17 16.5v5.17" />
      </m.g>

      <m.g
       variants={groupVariants}
       custom={0}
       animate={controls}
       initial="normal"
      >
       <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
       <path d="M12 8 7.26 5.15" />
       <path d="m12 8 4.74-2.85" />
       <path d="M12 13.5V8" />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BoxesIcon.displayName = "BoxesIcon";
export { BoxesIcon };
