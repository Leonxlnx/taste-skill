"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import {
  forwardRef,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "../../lib/taste-blocks/beui/ease";
import { cn } from "../../lib/taste-blocks/beui/utils";

export interface HoldActionButtonProps
  extends Omit<
    HTMLMotionProps<"button">,
    | "children"
    | "type"
    | "onClick"
    | "onPointerDown"
    | "onPointerUp"
    | "onPointerCancel"
    | "onPointerLeave"
    | "onKeyDown"
    | "onKeyUp"
  > {
  children: ReactNode;
  type?: "vertical" | "horizontal";
  holdingLabel?: ReactNode;
  completeLabel?: ReactNode;
  holdDuration?: number;
  onHoldComplete?: () => void;
  fillClassName?: string;
  labelClassName?: string;
}

export const HoldActionButton = forwardRef<
  HTMLButtonElement,
  HoldActionButtonProps
>(function HoldActionButton(
  {
    children,
    type = "vertical",
    holdingLabel = "Keep holding",
    completeLabel = "Done",
    holdDuration = 1600,
    onHoldComplete,
    fillClassName,
    labelClassName,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  const completedRef = useRef(false);
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startHold = () => {
    if (disabled || holding) return;
    completedRef.current = false;
    setCompleted(false);
    setHolding(true);
  };

  const cancelHold = () => {
    setHolding(false);
    setCompleted(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic accessibility input may not own an active pointer.
    }
    startHold();
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelHold();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      cancelHold();
    }
  };

  const handleFillComplete = () => {
    if (!holding || completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    onHoldComplete?.();
  };

  const active = holding || completed;
  const activeTransform =
    type === "horizontal" ? "scaleX(1)" : "translateY(0%)";
  const idleTransform =
    type === "horizontal" ? "scaleX(0)" : "translateY(115%)";

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={typeof children === "string" ? children : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(event) => event.preventDefault()}
      whileTap={reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={cn(
        "relative inline-grid h-16 min-w-72 touch-none select-none place-items-center overflow-hidden rounded-[22px] bg-primary px-8 text-primary-foreground",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <motion.span
        aria-hidden="true"
        style={{
          transformOrigin:
            type === "horizontal" ? "var(--beui-hold-origin)" : "center",
        }}
        initial={false}
        animate={
          reduce
            ? { opacity: active ? 1 : 0, transform: "none" }
            : {
                opacity: 1,
                transform: active ? activeTransform : idleTransform,
              }
        }
        transition={
          active
            ? { duration: holdDuration / 1000, ease: "linear" }
            : { duration: reduce ? 0.15 : 0.24, ease: EASE_OUT }
        }
        onAnimationComplete={handleFillComplete}
        className={cn(
          "absolute inset-0 bg-sky-400 will-change-[opacity,transform] [--beui-hold-origin:left] rtl:[--beui-hold-origin:right]",
          fillClassName,
        )}
      >
        {!reduce ? (
          type === "horizontal" ? (
            <motion.svg
              viewBox="0 0 24 240"
              preserveAspectRatio="none"
              aria-hidden="true"
              animate={{
                transform: active ? "translateY(-50%)" : "translateY(0%)",
              }}
              transition={{
                duration: 1.1,
                ease: "linear",
                repeat: active ? Number.POSITIVE_INFINITY : 0,
              }}
              className="absolute -end-5 top-0 h-[200%] w-6 text-sky-400 rtl:-scale-x-100"
            >
              <path
                d="M0 0h12C2 20 2 40 12 60s10 40 0 60-10 40 0 60 10 40 0 60H0Z"
                fill="currentColor"
              />
            </motion.svg>
          ) : (
            <motion.svg
              viewBox="0 0 240 24"
              preserveAspectRatio="none"
              aria-hidden="true"
              animate={{
                transform: active ? "translateX(-50%)" : "translateX(0%)",
              }}
              transition={{
                duration: 1.1,
                ease: "linear",
                repeat: active ? Number.POSITIVE_INFINITY : 0,
              }}
              className="absolute -top-5 left-0 h-6 w-[200%] text-sky-400"
            >
              <path
                d="M0 12C20 2 40 2 60 12s40 10 60 0 40-10 60 0 40 10 60 0v12H0Z"
                fill="currentColor"
              />
            </motion.svg>
          )
        ) : null}
      </motion.span>

      <span
        className={cn(
          "relative z-10 grid place-items-center text-base font-medium tracking-[-0.01em]",
          labelClassName,
        )}
      >
        <motion.span
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {children}
        </motion.span>
        <motion.span
          aria-hidden={!holding || completed}
          animate={{ opacity: holding && !completed ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {holdingLabel}
        </motion.span>
        <motion.span
          aria-hidden={!completed}
          animate={{ opacity: completed ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {completeLabel}
        </motion.span>
      </span>
    </motion.button>
  );
});
