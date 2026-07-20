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
export interface MailIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface MailIconProps extends Omit<
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

const MailIcon = forwardRef<MailIconHandle, MailIconProps>(
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
  const flapControls = useAnimation();
  const bodyControls = useAnimation();
  const containerControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      containerControls.start("normal");
      flapControls.start("normal");
      bodyControls.start("normal");
     } else {
      containerControls.start("animate");
      flapControls.start("animate");
      bodyControls.start("animate");
     }
    },
    stopAnimation: () => {
     containerControls.start("normal");
     flapControls.start("normal");
     bodyControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     containerControls.start("animate");
     flapControls.start("animate");
     bodyControls.start("animate");
    } else onMouseEnter?.(e as any);
   },
   [
    containerControls,
    flapControls,
    bodyControls,
    reduced,
    onMouseEnter,
    isAnimated,
   ],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     containerControls.start("normal");
     flapControls.start("normal");
     bodyControls.start("normal");
    } else onMouseLeave?.(e as any);
   },
   [containerControls, flapControls, bodyControls, onMouseLeave],
  );

  const containerVariants: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.04, 1],
    transition: { duration: 0.36 * duration, ease: "easeOut" },
   },
  };

  const flapVariants: Variants = {
   normal: { rotateX: 0, translateY: 0, transformOrigin: "12px 6px" },
   animate: {
    rotateX: [-0, -12, 2, 0],
    translateY: [0, -1.6, 0.6, 0],
    transition: {
     duration: 0.45 * duration,
     ease: "easeOut",
     times: [0, 0.5, 0.85, 1],
    },
   },
  };

  const bodyVariants: Variants = {
   normal: { opacity: 1 },
   animate: {
    opacity: [1, 0.95, 1],
    transition: { duration: 0.45 * duration, ease: "easeOut" },
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
     initial="normal"
     animate={containerControls}
     variants={containerVariants}
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
      <m.path
       d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
       initial="normal"
       animate={flapControls}
       variants={flapVariants}
       style={{ transformStyle: "preserve-3d" }}
      />
      <m.rect
       x="2"
       y="4"
       width="20"
       height="16"
       rx="2"
       initial="normal"
       animate={bodyControls}
       variants={bodyVariants}
      />
     </svg>
    </m.div>
   </LazyMotion>
  );
 },
);

MailIcon.displayName = "MailIcon";
export { MailIcon };
