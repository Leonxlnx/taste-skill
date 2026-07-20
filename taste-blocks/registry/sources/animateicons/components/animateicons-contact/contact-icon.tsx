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
export interface ContactIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface ContactIconProps extends Omit<
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

const ContactIcon = forwardRef<ContactIconHandle, ContactIconProps>(
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

  const rectVariants: Variants = {
   normal: { strokeDashoffset: 0, opacity: 1 },
   animate: {
    strokeDashoffset: [100, 0],
    opacity: [0.3, 1],
    transition: { duration: 0.8 * duration, ease: "easeInOut" },
   },
  };

  const circleVariants: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [0.5, 1.2, 1],
    opacity: [0, 1],
    transition: { duration: 0.6 * duration, delay: 0.3, ease: "easeOut" },
   },
  };

  const lineVariants: Variants = {
   normal: { x: 0, opacity: 1 },
   animate: {
    x: [-10, 0],
    opacity: [0, 1],
    transition: { duration: 0.4 * duration, ease: "easeOut", delay: 0.6 },
   },
  };

  const curveVariants: Variants = {
   normal: { opacity: 1, strokeDashoffset: 0 },
   animate: {
    strokeDashoffset: [30, 0],
    opacity: [0, 1],
    transition: { duration: 0.6 * duration, delay: 0.5, ease: "easeInOut" },
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
      className="lucide lucide-contact-icon lucide-contact"
     >
      <m.path
       d="M16 2v2"
       variants={lineVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
       strokeDasharray="30"
       strokeDashoffset="0"
       variants={curveVariants}
       initial="normal"
       animate={controls}
      />
      <m.path
       d="M8 2v2"
       variants={lineVariants}
       initial="normal"
       animate={controls}
      />
      <m.circle
       cx="12"
       cy="11"
       r="3"
       variants={circleVariants}
       initial="normal"
       animate={controls}
      />
      <m.rect
       x="3"
       y="4"
       width="18"
       height="18"
       rx="2"
       strokeDasharray="100"
       strokeDashoffset="0"
       variants={rectVariants}
       initial="normal"
       animate={controls}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

ContactIcon.displayName = "ContactIcon";
export { ContactIcon };
