/**
 * Split-Flap Panel — a CSS-3D recreation of Solari-style departure boards.
 * Built by Cody Shanley · https://codyshanley.com/playground/split-flap?utm_source=github&utm_medium=attribution&utm_campaign=split-flap
 * MIT licensed. Free to use, modify, and redistribute.
 */
"use client";

import { useEffect, useRef, useState } from "react";

export const SPLITFLAP_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789. ";

function nextChar(c: string): string {
  const i = SPLITFLAP_ALPHABET.indexOf(c);
  return SPLITFLAP_ALPHABET[(i + 1) % SPLITFLAP_ALPHABET.length] ?? " ";
}

/** Forward-only distance from `from` to `to` on the one-way alphabet chain.
 *  Matches real Solari motion: X -> D = 18 through the remaining alphabet. */
export function computeFlipCount(from: string, to: string): number {
  const a = SPLITFLAP_ALPHABET.indexOf(from);
  const b = SPLITFLAP_ALPHABET.indexOf(to);
  if (a < 0 || b < 0) return 0;
  return (b - a + SPLITFLAP_ALPHABET.length) % SPLITFLAP_ALPHABET.length;
}

interface Props {
  target: string;
  stepMs?: number;
  startDelayMs?: number;
  minFlips?: number;
  onFlip?: () => void;
  onSettled?: (target: string) => void;
  size?: "default" | "xl" | "compact" | "hero";
  /** Freeze the slat in a mid-flip pose for visual inspection. Disables animation. */
  frozenMidFlip?: boolean;
  /** Debug: override the letters shown. Useful for static reference slats. */
  staticLetter?: string;
  /** Letter to display as the initial state without animation. Read once at mount. */
  initialCurrent?: string;
}

export function SplitFlapSlat({
  target,
  stepMs = 110,
  startDelayMs = 0,
  minFlips = 1,
  onFlip,
  onSettled,
  size = "default",
  frozenMidFlip = false,
  staticLetter,
  initialCurrent,
}: Props) {
  const [current, setCurrent] = useState<string>(staticLetter ?? initialCurrent ?? " ");
  const [next, setNext] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const currentRef = useRef(current);
  const onFlipRef = useRef(onFlip);
  const onSettledRef = useRef(onSettled);
  onFlipRef.current = onFlip;
  onSettledRef.current = onSettled;

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (staticLetter !== undefined || frozenMidFlip) return;

    let cancelled = false;
    let finished = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: { run: () => void; remaining: number; startedAt: number } | undefined;
    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const finish = (value: string) => {
      if (cancelled || finished) return;
      finished = true;
      currentRef.current = value;
      setCurrent(value);
      setIsFlipping(false);
      setNext(null);
      onSettledRef.current?.(value);
    };

    const arm = () => {
      if (cancelled || !pending || document.hidden) return;
      const task = pending;
      task.startedAt = Date.now();
      timer = setTimeout(() => {
        timer = undefined;
        if (pending !== task) return;
        pending = undefined;
        task.run();
      }, task.remaining);
    };

    const schedule = (run: () => void, delay: number) => {
      pending = { run, remaining: Math.max(0, delay), startedAt: 0 };
      arm();
    };

    const pause = () => {
      if (timer === undefined || !pending) return;
      clearTimeout(timer);
      timer = undefined;
      pending.remaining = Math.max(0, pending.remaining - (Date.now() - pending.startedAt));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) pause();
      else arm();
    };

    const snapToTarget = () => {
      pause();
      pending = undefined;
      finish(target);
    };

    setIsFlipping(false);
    setNext(null);

    if (
      motionQuery?.matches ||
      !SPLITFLAP_ALPHABET.includes(currentRef.current) ||
      !SPLITFLAP_ALPHABET.includes(target)
    ) {
      snapToTarget();
      return;
    }

    const flipsNeeded = () => {
      let distance = computeFlipCount(currentRef.current, target);
      if (distance !== 0 && distance < minFlips) distance += SPLITFLAP_ALPHABET.length;
      return distance;
    };

    const runFlip = (remaining: number) => {
      if (cancelled) return;
      if (remaining <= 0) {
        finish(target);
        return;
      }
      const nextCharacter = nextChar(currentRef.current);
      setNext(nextCharacter);
      setIsFlipping(true);
      onFlipRef.current?.();

      schedule(() => {
        if (cancelled) return;
        currentRef.current = nextCharacter;
        setCurrent(nextCharacter);
        setIsFlipping(false);
        setNext(null);
        schedule(() => runFlip(remaining - 1), 18);
      }, stepMs);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery?.addEventListener("change", snapToTarget, { once: true });
    schedule(() => {
      const count = flipsNeeded();
      if (count === 0) finish(target);
      else runFlip(count);
    }, startDelayMs);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
      pending = undefined;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery?.removeEventListener("change", snapToTarget);
    };
  }, [target, stepMs, startDelayMs, minFlips, staticLetter, frozenMidFlip]);

  const displayCurrent = staticLetter ?? current;
  const displayNext = frozenMidFlip ? nextChar(displayCurrent) : next;
  const showFlippers = frozenMidFlip || (isFlipping && displayNext !== null);

  return (
    <span
      className={`splitflap-slat${
        size === "xl"
          ? " splitflap-slat--xl"
          : size === "compact"
            ? " splitflap-slat--compact"
            : size === "hero"
              ? " splitflap-slat--hero"
              : ""
      }`}
      aria-hidden="true"
    >
      <span className="splitflap-inner">
        <span className="splitflap-half splitflap-half--top">
          <span className="splitflap-letter">
            {showFlippers && displayNext !== null ? displayNext : displayCurrent}
          </span>
        </span>
        <span className="splitflap-half splitflap-half--bottom">
          <span className="splitflap-letter">{displayCurrent}</span>
        </span>
        {showFlippers && displayNext !== null && (
          <>
            <span
              className={`splitflap-flipping-top${
                frozenMidFlip ? " splitflap-flipping-top--frozen" : ""
              }`}
              key={`ft-${displayCurrent}-${displayNext}`}
            >
              <span className="splitflap-letter">{displayCurrent}</span>
            </span>
            <span
              className={`splitflap-flipping-bottom${
                frozenMidFlip ? " splitflap-flipping-bottom--frozen" : ""
              }`}
              key={`fb-${displayCurrent}-${displayNext}`}
            >
              <span className="splitflap-letter">{displayNext}</span>
            </span>
          </>
        )}
      </span>
    </span>
  );
}
