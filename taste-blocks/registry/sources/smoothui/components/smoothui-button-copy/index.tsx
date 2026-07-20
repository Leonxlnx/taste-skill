"use client";

import { Check, CircleX, Copy, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface ButtonCopyProps {
  className?: string;
  disabled?: boolean;
  duration?: number;
  idleIcon?: ReactNode;
  loadingDuration?: number;
  loadingIcon?: ReactNode;
  onCopy?: () => Promise<void> | void;
  successIcon?: ReactNode;
}

const defaultIcons = {
  idle: <Copy size={16} />,
  loading: <LoaderCircle size={16} />,
  error: <CircleX size={16} />,
  success: <Check size={16} />,
};

export default function ButtonCopy({
  onCopy,
  idleIcon = defaultIcons.idle,
  loadingIcon = defaultIcons.loading,
  successIcon = defaultIcons.success,
  className = "",
  duration = 2000,
  loadingDuration = 0,
  disabled = false,
}: ButtonCopyProps) {
  const [buttonState, setButtonState] = useState<
    "error" | "idle" | "loading" | "success"
  >("idle");
  const [announcement, setAnnouncement] = useState("");
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const resetTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (!onCopy || disabled || busyRef.current) return;

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    busyRef.current = true;
    setButtonState("loading");
    setAnnouncement("Copying");

    try {
      await onCopy();
    } catch {
      busyRef.current = false;
      if (!mountedRef.current) return;
      setButtonState("error");
      setAnnouncement("Copy failed");
      resetTimerRef.current = window.setTimeout(() => {
        if (!mountedRef.current || busyRef.current) return;
        setButtonState("idle");
        setAnnouncement("");
      }, Math.max(0, duration));
      return;
    }

    if (!mountedRef.current) return;
    successTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setButtonState("success");
      setAnnouncement("Copied");
      resetTimerRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        busyRef.current = false;
        setButtonState("idle");
        setAnnouncement("");
      }, Math.max(0, duration));
    }, Math.max(0, loadingDuration));
  }, [disabled, duration, loadingDuration, onCopy]);

  const icons = {
    error: defaultIcons.error,
    idle: idleIcon,
    loading: loadingIcon,
    success: successIcon,
  };

  const ariaLabels = {
    error: "Copy failed",
    idle: "Copy",
    loading: "Copying...",
    success: "Copied",
  };

  return (
    <div className="flex justify-center">
      <button
        aria-busy={buttonState === "loading"}
        aria-disabled={busyRef.current || undefined}
        aria-label={ariaLabels[buttonState]}
        className={`relative min-h-[44px] w-auto min-w-[44px] cursor-pointer overflow-hidden rounded-full border bg-background p-3 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[state=error]:text-destructive disabled:opacity-50 ${className}`}
        data-state={buttonState}
        disabled={disabled || !onCopy}
        onClick={handleClick}
        type="button"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            className="flex w-full items-center justify-center"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, y: 25, filter: "blur(10px)" }
            }
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: -25, filter: "blur(10px)" }
            }
            key={buttonState}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring" as const, duration: 0.25, bounce: 0 }
            }
          >
            {icons[buttonState]}
          </motion.span>
        </AnimatePresence>
      </button>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
