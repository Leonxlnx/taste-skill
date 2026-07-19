"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import "./hold-to-confirm.css";

export interface HoldToConfirmProps {
  idleLabel?: string;
  holdingLabel?: string;
  armedLabel?: string;
  confirmedLabel?: string;
  duration?: number;
  disabled?: boolean;
  onConfirm: () => void;
}

type HoldState = "idle" | "holding" | "armed" | "confirmed";

export function HoldToConfirm({
  idleLabel = "Hold to confirm",
  holdingLabel = "Keep holding",
  armedLabel = "Activate again to confirm",
  confirmedLabel = "Confirmed",
  duration = 1200,
  disabled = false,
  onConfirm,
}: HoldToConfirmProps) {
  const [state, setState] = useState<HoldState>("idle");
  const confirmTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);
  const stateRef = useRef<HoldState>("idle");
  const disabledRef = useRef(disabled);
  const onConfirmRef = useRef(onConfirm);
  const instructionId = useId();
  const holdDuration = Number.isFinite(duration) ? Math.max(300, duration) : 1200;

  disabledRef.current = disabled;
  onConfirmRef.current = onConfirm;

  function updateState(next: HoldState) {
    stateRef.current = next;
    setState(next);
  }

  function clearConfirmTimer() {
    if (confirmTimer.current !== null) {
      window.clearTimeout(confirmTimer.current);
      confirmTimer.current = null;
    }
  }

  function clearResetTimer() {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }

  function clearTimers() {
    clearConfirmTimer();
    clearResetTimer();
  }

  function returnToIdle() {
    clearTimers();
    if (stateRef.current !== "idle") updateState("idle");
  }

  function confirm() {
    if (disabledRef.current || stateRef.current === "confirmed") return;
    clearTimers();
    updateState("confirmed");
    resetTimer.current = window.setTimeout(() => {
      resetTimer.current = null;
      updateState("idle");
    }, 1400);
    onConfirmRef.current();
  }

  function startHold() {
    if (
      disabledRef.current ||
      stateRef.current === "holding" ||
      stateRef.current === "confirmed"
    ) {
      return;
    }
    clearTimers();
    updateState("holding");
    confirmTimer.current = window.setTimeout(() => {
      confirmTimer.current = null;
      confirm();
    }, holdDuration);
  }

  function cancelHold() {
    if (stateRef.current !== "holding") return;
    clearConfirmTimer();
    updateState("idle");
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startHold();
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelHold();
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 0) {
      event.preventDefault();
      return;
    }
    if (stateRef.current === "armed") {
      confirm();
      return;
    }
    if (stateRef.current !== "idle") return;

    updateState("armed");
    resetTimer.current = window.setTimeout(() => {
      resetTimer.current = null;
      if (stateRef.current === "armed") updateState("idle");
    }, 5000);
  }

  useEffect(() => {
    if (disabled) returnToIdle();
  }, [disabled]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) returnToIdle();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimers();
    };
  }, []);

  const label =
    state === "confirmed"
      ? confirmedLabel
      : state === "holding"
        ? holdingLabel
        : state === "armed"
          ? armedLabel
          : idleLabel;
  const style = { "--tb-hold-duration": `${holdDuration}ms` } as CSSProperties;

  return (
    <div className="tb-hold-wrap">
      <button
        aria-describedby={instructionId}
        className="tb-hold"
        data-state={state}
        disabled={disabled}
        onBlur={returnToIdle}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            returnToIdle();
          }
        }}
        onLostPointerCapture={cancelHold}
        onPointerCancel={cancelHold}
        onPointerDown={handlePointerDown}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            cancelHold();
          }
        }}
        onPointerUp={handlePointerUp}
        style={style}
        type="button"
      >
        <span className="tb-hold__progress" aria-hidden="true" />
        <span className="tb-hold__label">{label}</span>
      </button>
      <span className="tb-hold__instruction" id={instructionId}>
        Hold with a pointer, or activate twice with a keyboard or assistive technology.
      </span>
      <span className="tb-hold__status" aria-live="polite">
        {state === "holding"
          ? holdingLabel
          : state === "armed"
            ? armedLabel
            : state === "confirmed"
              ? confirmedLabel
              : ""}
      </span>
    </div>
  );
}
