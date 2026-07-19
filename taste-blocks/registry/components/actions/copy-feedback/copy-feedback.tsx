"use client";

import { useEffect, useRef, useState } from "react";
import "./copy-feedback.css";

export interface CopyFeedbackProps {
  value: string;
  label?: string;
}

type CopyState = "idle" | "copying" | "copied" | "error";

async function writeClipboard(value: string) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const previousFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement("textarea");

  try {
    field.value = value;
    field.readOnly = true;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.focus({ preventScroll: true });
    field.select();
    if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
  } finally {
    field.remove();
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
}

export function CopyFeedback({ value, label = "Copy value" }: CopyFeedbackProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const requestId = useRef(0);

  async function copy() {
    if (inFlight.current) return;
    inFlight.current = true;
    const currentRequest = ++requestId.current;
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = null;
    setState("copying");

    let result: CopyState;
    try {
      await writeClipboard(value);
      result = "copied";
    } catch {
      result = "error";
    }

    if (!mounted.current || currentRequest !== requestId.current) return;
    inFlight.current = false;
    setState(result);
    resetTimer.current = window.setTimeout(() => {
      setState("idle");
      resetTimer.current = null;
    }, 1800);
  }

  useEffect(() => {
    requestId.current += 1;
    inFlight.current = false;
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = null;
    setState("idle");
  }, [value]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
      inFlight.current = false;
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  return (
    <div className="tb-copy" data-state={state} aria-busy={state === "copying"}>
      <code className="tb-copy__value">{value}</code>
      <button
        aria-disabled={state === "copying"}
        className="tb-copy__button"
        onClick={copy}
        type="button"
      >
        {state === "copying"
          ? "Copying"
          : state === "copied"
            ? "Copied"
            : state === "error"
              ? "Try again"
              : label}
      </button>
      <span className="tb-copy__status" aria-live="polite">
        {state === "copying"
          ? "Copying value."
          : state === "copied"
            ? "Copied to clipboard."
            : state === "error"
              ? "Could not access the clipboard. Select and copy the value manually."
              : ""}
      </span>
    </div>
  );
}
