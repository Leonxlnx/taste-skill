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
export interface FolderOpenIconHandle {
 startAnimation: () => void;
 stopAnimation: () => void;
}

interface FolderOpenIconProps extends Omit<
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

const FolderOpenIcon = forwardRef<FolderOpenIconHandle, FolderOpenIconProps>(
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
  const folderControls = useAnimation();
  const paperControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(ref, () => {
   isControlled.current = true;
   return {
    startAnimation: () => {
     if (!isAnimated || reduced) {
      folderControls.start("normal");
      paperControls.start("normal");
     } else {
      folderControls.start("animate");
      paperControls.start("animate");
     }
    },
    stopAnimation: () => {
     folderControls.start("normal");
     paperControls.start("normal");
    },
   };
  });

  const handleEnter = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnimated || reduced) return;
    if (!isControlled.current) {
     folderControls.start("animate");
     paperControls.start("animate");
    } else {
     onMouseEnter?.(e as any);
    }
   },
   [folderControls, paperControls, reduced, onMouseEnter, isAnimated],
  );

  const handleLeave = useCallback(
   (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!isControlled.current) {
     folderControls.start("normal");
     paperControls.start("normal");
    } else {
     onMouseLeave?.(e as any);
    }
   },
   [folderControls, paperControls, onMouseLeave],
  );

  const folderVariants: Variants = {
   normal: { scale: 1, rotate: 0, y: 0 },
   animate: {
    scale: [1, 1.05, 0.97, 1],
    rotate: [0, -2, 2, 0],
    y: [0, -1.5, 0.5, 0],
    transition: { duration: 0.9 * duration, ease: "easeInOut" },
   },
  };

  const paperVariants: Variants = {
   normal: { y: 0, opacity: 0 },
   animate: {
    y: [-6, 0],
    opacity: [0, 1, 0],
    transition: { duration: 1 * duration, ease: "easeInOut", delay: 0.2 },
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
       d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
       animate={folderControls}
       initial="normal"
       variants={folderVariants}
      />
      <m.rect
       x="7"
       y="11"
       width="10"
       height="6"
       rx="1"
       animate={paperControls}
       initial="normal"
       variants={paperVariants}
      />
     </m.svg>
    </m.div>
   </LazyMotion>
  );
 },
);

FolderOpenIcon.displayName = "FolderOpenIcon";
export { FolderOpenIcon };
