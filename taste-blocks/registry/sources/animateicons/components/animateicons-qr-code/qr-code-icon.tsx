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
export interface QrCodeIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface QrCodeIconProps extends Omit<
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

const QrCodeIcon = forwardRef<QrCodeIconHandle, QrCodeIconProps>(
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

  const container: Variants = {
   normal: { scale: 1 },
   animate: {
    scale: [1, 1.04, 1],
    transition: {
     duration: 0.35 * duration,
     ease: "easeOut",
    },
   },
  };

  const block = (x: number, y: number): Variants => ({
   normal: {
    x: 0,
    y: 0,
    opacity: 1,
   },
   animate: {
    x: [0, x, 0],
    y: [0, y, 0],
    opacity: [1, 0.7, 1],
    transition: {
     duration: 0.4 * duration,
     ease: "easeOut",
    },
   },
  });

  const bit: Variants = {
   normal: { scale: 1, opacity: 1 },
   animate: {
    scale: [1, 0.6, 1],
    opacity: [1, 0.5, 1],
    transition: {
     duration: 0.3 * duration,
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
      variants={container}
      initial="normal"
      animate={controls}
     >
      <m.rect
       width="5"
       height="5"
       x="3"
       y="3"
       rx="1"
       variants={block(-2, -2)}
      />
      <m.rect
       width="5"
       height="5"
       x="16"
       y="3"
       rx="1"
       variants={block(2, -2)}
      />
      <m.rect
       width="5"
       height="5"
       x="3"
       y="16"
       rx="1"
       variants={block(-2, 2)}
      />

      <m.path d="M21 16h-3a2 2 0 0 0-2 2v3" variants={bit} />
      <m.path d="M21 21v.01" variants={bit} />
      <m.path d="M12 7v3a2 2 0 0 1-2 2H7" variants={bit} />
      <m.path d="M3 12h.01" variants={bit} />
      <m.path d="M12 3h.01" variants={bit} />
      <m.path d="M12 16v.01" variants={bit} />
      <m.path d="M16 12h1" variants={bit} />
      <m.path d="M21 12v.01" variants={bit} />
      <m.path d="M12 21v-1" variants={bit} />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

QrCodeIcon.displayName = "QrCodeIcon";
export { QrCodeIcon };
