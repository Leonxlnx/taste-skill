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
export interface WifiCogIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface WifiCogIconProps extends Omit<
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

const WifiCogIcon = forwardRef<WifiCogIconHandle, WifiCogIconProps>(
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
  const arcLargeControls = useAnimation();
  const arcMidControls = useAnimation();
  const arcSmallControls = useAnimation();
  const cogControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      groupControls.start("normal");
      arcLargeControls.start("normal");
      arcMidControls.start("normal");
      arcSmallControls.start("normal");
      cogControls.start("normal");
     } else {
      groupControls.start("animate");
      arcLargeControls.start("animate");
      arcMidControls.start("animate");
      arcSmallControls.start("animate");
      cogControls.start("animate");
     }
    },
    stopAnimation: () => {
     groupControls.start("normal");
     arcLargeControls.start("normal");
     arcMidControls.start("normal");
     arcSmallControls.start("normal");
     cogControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     groupControls.start("animate");
     arcLargeControls.start("animate");
     arcMidControls.start("animate");
     arcSmallControls.start("animate");
     cogControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    groupControls,
    arcLargeControls,
    arcMidControls,
    arcSmallControls,
    cogControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     groupControls.start("normal");
     arcLargeControls.start("normal");
     arcMidControls.start("normal");
     arcSmallControls.start("normal");
     cogControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [
    groupControls,
    arcLargeControls,
    arcMidControls,
    arcSmallControls,
    cogControls,
    onMouseLeave,
   ],
  );

  const groupVariants: Variants = {
   normal: { scale: 1, rotate: 0 },
   animate: {
    scale: [1, 1.05, 0.98, 1],
    rotate: [0, -2, 2, 0],
    transition: { duration: 0.9 * duration, ease: [0.22, 0.9, 0.32, 1] },
   },
  };

  const arcLargeVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.9 * duration, ease: "easeOut", delay: 0.05 },
   },
  };

  const arcMidVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.8 * duration, ease: "easeOut", delay: 0.1 },
   },
  };

  const arcSmallVariants: Variants = {
   normal: { pathLength: 1, opacity: 1 },
   animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.7 * duration, ease: "easeOut", delay: 0.15 },
   },
  };

  const cogVariants: Variants = {
   normal: { rotate: 0, opacity: 1, scale: 1 },
   animate: {
    rotate: [0, 90, 180, 270, 360],
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 1],
    transition: { duration: 1.2 * duration, ease: "easeInOut", repeat: 0 },
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="normal"
      animate={groupControls}
      variants={groupVariants}
     >
      <m.path
       d="M2 7.82a15 15 0 0 1 20 0"
       initial="normal"
       animate={arcLargeControls}
       variants={arcLargeVariants}
      />
      <m.path
       d="M5 11.858a10 10 0 0 1 11.5-1.785"
       initial="normal"
       animate={arcMidControls}
       variants={arcMidVariants}
      />
      <m.path
       d="M8.5 15.429a5 5 0 0 1 2.413-1.31"
       initial="normal"
       animate={arcSmallControls}
       variants={arcSmallVariants}
      />
      <m.g initial="normal" animate={cogControls} variants={cogVariants}>
       <m.path d="m14.305 19.53.923-.382" />
       <m.path d="m15.228 16.852-.923-.383" />
       <m.path d="m16.852 15.228-.383-.923" />
       <m.path d="m16.852 20.772-.383.924" />
       <m.path d="m19.148 15.228.383-.923" />
       <m.path d="m19.53 21.696-.382-.924" />
       <m.path d="m20.772 16.852.924-.383" />
       <m.path d="m20.772 19.148.924.383" />
       <m.circle cx="18" cy="18" r="3" />
      </m.g>
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

WifiCogIcon.displayName = "WifiCogIcon";
export { WifiCogIcon };
