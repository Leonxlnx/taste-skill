"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../lib/utils";

export interface PercentBadgeIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PercentBadgeIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimated?: boolean;
}

const BADGE_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 10,
      duration: 0.28,
    },
  },
  animate: {
    rotate: 180,
    transition: {
      delay: 0.08,
      type: "spring",
      stiffness: 80,
      damping: 13,
    },
  },
};

const PercentBadgeIcon = forwardRef<
  PercentBadgeIconHandle,
  PercentBadgeIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 28, isAnimated = true, ...props }, ref) => {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => (!isAnimated || reduced ? controls.start("normal") : controls.start("animate")),
      stopAnimation: () => controls.start("normal"),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAnimated || reduced) return;
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start("animate");
      }
    },
    [controls, isAnimated, onMouseEnter, reduced]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start("normal");
      }
    },
    [controls, onMouseLeave]
  );

  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          animate={controls}
          d="M20.9899 11.994C20.9899 13.2624 20.3603 14.3838 19.3966 15.0625C19.598 16.2238 19.2503 17.4618 18.3537 18.3586C17.457 19.2554 16.2192 19.603 15.058 19.4016C14.3793 20.3653 13.2582 20.9949 11.9901 20.9949C10.7219 20.9949 9.60083 20.3654 8.92216 19.4017C7.7608 19.6034 6.52272 19.2557 5.62589 18.3588C4.72906 17.4618 4.38145 16.2236 4.58306 15.0622C3.61963 14.3834 2.99023 13.2622 2.99023 11.994C2.99023 10.7258 3.61968 9.60457 4.58318 8.92582C4.38168 7.76442 4.7293 6.52634 5.62605 5.62949C6.52282 4.73262 7.76077 4.38496 8.92206 4.5865C9.60071 3.62277 10.7219 2.99316 11.9901 2.99316C13.2582 2.99316 14.3793 3.62272 15.058 4.58638C16.2193 4.38474 17.4574 4.73239 18.3542 5.62932C19.251 6.52624 19.5987 7.76443 19.3971 8.92591C20.3605 9.60467 20.9899 10.7258 20.9899 11.994Z"
          style={{ originX: "50%", originY: "50%" }}
          variants={BADGE_VARIANTS}
        />
        <path d="M8.99044 14.9934L14.9903 8.99282" />
        <path d="M9.74042 9.74289H9.74792V9.75039H9.74042V9.74289ZM10.1154 9.74289C10.1154 9.95002 9.94752 10.1179 9.74042 10.1179C9.53332 10.1179 9.36543 9.95002 9.36543 9.74289C9.36543 9.53576 9.53332 9.36785 9.74042 9.36785C9.94752 9.36785 10.1154 9.53576 10.1154 9.74289Z" />
        <path d="M14.2403 14.2433H14.2478V14.2508H14.2403V14.2433ZM14.6153 14.2433C14.6153 14.4504 14.4474 14.6184 14.2403 14.6184C14.0332 14.6184 13.8653 14.4504 13.8653 14.2433C13.8653 14.0362 14.0332 13.8683 14.2403 13.8683C14.4474 13.8683 14.6153 14.0362 14.6153 14.2433Z" />
      </svg>
    </div>
  );
});

PercentBadgeIcon.displayName = "PercentBadgeIcon";

export { PercentBadgeIcon };
