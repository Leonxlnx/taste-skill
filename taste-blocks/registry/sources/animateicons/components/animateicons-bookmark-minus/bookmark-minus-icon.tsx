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
export interface BookmarkMinusIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface BookmarkMinusIconProps extends Omit<
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

const BookmarkMinusIcon = forwardRef<
 BookmarkMinusIconHandle,
 BookmarkMinusIconProps
>(
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

  const bookmarkVariants: Variants = {
   normal: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
   },
   animate: {
    y: [0, -4, 0],
    scaleY: [1, 1.1, 0.95, 1],
    scaleX: [1, 0.97, 1.02, 1],
    transition: {
     duration: 0.45 * duration,
     ease: "easeOut",
    },
   },
  };

  const minusVariants: Variants = {
   normal: { scaleX: 1, opacity: 1 },
   animate: {
    scaleX: [1, 0.7, 1.2, 1],
    opacity: [1, 0.6, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
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
      animate={controls}
      initial="normal"
      variants={bookmarkVariants}
     >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      <m.line x1="15" x2="9" y1="10" y2="10" variants={minusVariants} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

BookmarkMinusIcon.displayName = "BookmarkMinusIcon";
export { BookmarkMinusIcon };
