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
export interface GlobeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface GlobeIconProps extends Omit<
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

const GlobeIcon = forwardRef<GlobeIconHandle, GlobeIconProps>(
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
  const pathControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      controls.start("normal");
      pathControls.start("normal");
     } else {
      controls.start("animate");
      pathControls.start("animate");
     }
    },
    stopAnimation: () => {
     controls.start("normal");
     pathControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     controls.start("animate");
     pathControls.start("animate");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [controls, pathControls, reduced, isAnimated, onMouseEnter],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     controls.start("normal");
     pathControls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [controls, pathControls, onMouseLeave],
  );

  const svgVariants: Variants = {
   normal: {
    scale: 1,
    rotate: 0,
   },
   animate: {
    scale: [1, 1.03, 1],
    rotate: 360,
    transition: {
     rotate: {
      duration: 1.4 * duration,
      ease: "linear",
     },
     scale: {
      duration: 0.25 * duration,
      ease: "easeOut",
     },
    },
   },
  };

  const outlineVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    pathLength: [0.9, 1],
    opacity: [0.8, 1],
    transition: {
     duration: 0.35 * duration,
     ease: "easeOut",
    },
   },
  };

  const orbitVariants: Variants = {
   normal: {
    pathLength: 1,
    opacity: 1,
   },
   animate: {
    pathLength: [0, 1],
    opacity: [0.5, 1],
    transition: {
     duration: 0.4 * duration,
     delay: 0.08 * duration,
     ease: "easeOut",
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
      animate={controls}
      initial="normal"
      variants={svgVariants}
     >
      <m.circle
       cx="12"
       cy="12"
       r="10"
       variants={outlineVariants}
       initial="normal"
       animate={pathControls}
      />
      <m.path
       d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
       variants={orbitVariants}
       initial="normal"
       animate={pathControls}
      />
      <m.path
       d="M2 12h20"
       variants={orbitVariants}
       initial="normal"
       animate={pathControls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

GlobeIcon.displayName = "GlobeIcon";
export { GlobeIcon };
