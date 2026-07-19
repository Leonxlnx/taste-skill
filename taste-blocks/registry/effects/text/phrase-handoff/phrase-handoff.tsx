"use client";

import { useLayoutEffect, useRef, useState } from "react";
import "./phrase-handoff.css";

export interface PhraseHandoffProps {
  prefix: string;
  phrases: string[];
  suffix?: string;
  className?: string;
}

export function PhraseHandoff({
  prefix,
  phrases,
  suffix = "",
  className = "",
}: PhraseHandoffProps) {
  const options = phrases.map((phrase) => phrase.trim()).filter(Boolean);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const phraseRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);

  const optionCount = Math.max(options.length, 1);
  const currentIndex = index % optionCount;
  const current = options[currentIndex] ?? "";
  const previousValue = useRef<string | null>(null);
  const sentence = [prefix, current, suffix].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const element = phraseRef.current;
    if (!element) return;
    if (previousValue.current === null) {
      previousValue.current = current;
      return;
    }
    if (previousValue.current === current) return;
    previousValue.current = current;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const running = animationRef.current;
    if (running) {
      try {
        running.commitStyles();
      } catch {
        // The animation may already be detached during rapid replacement.
      }
      running.cancel();
    }

    if (reducedMotion) {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      animationRef.current = null;
      return;
    }

    const computed = getComputedStyle(element);
    const settled = computed.transform === "none" && computed.opacity === "1";
    const offset = direction === "next" ? "8px" : "-8px";
    const animation = element.animate(
      [
        {
          opacity: settled ? 0.45 : Number.parseFloat(computed.opacity),
          transform: settled ? `translateY(${offset})` : computed.transform,
        },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 180,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      animation.cancel();
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      animationRef.current = null;
    };

    return () => {
      if (animationRef.current !== animation) return;
      try {
        animation.commitStyles();
      } catch {
        // Detached animations need no retained visual state.
      }
      animation.onfinish = null;
      animation.cancel();
      animationRef.current = null;
    };
  }, [current, direction]);

  if (options.length === 0) return null;

  function move(step: -1 | 1) {
    setDirection(step === 1 ? "next" : "previous");
    setIndex((current) => (current + step + options.length) % options.length);
  }

  return (
    <div className={`tb-phrase-handoff ${className}`.trim()}>
      <p className="tb-phrase-handoff__sr" aria-live="polite">
        {sentence}
      </p>
      <p className="tb-phrase-handoff__sentence" aria-hidden="true">
        <span>{prefix} </span>
        <span className="tb-phrase-handoff__slot">
          {options.map((option) => (
            <span className="tb-phrase-handoff__measure" key={option} aria-hidden="true">
              {option}
            </span>
          ))}
          <span
            className="tb-phrase-handoff__phrase"
            ref={phraseRef}
          >
            {current}
          </span>
        </span>
        {suffix ? <span> {suffix}</span> : null}
      </p>
      {options.length > 1 ? (
        <div className="tb-phrase-handoff__controls" role="group" aria-label="Phrase controls">
          <button type="button" onClick={() => move(-1)}>
            Previous
          </button>
          <span aria-hidden="true">
            {currentIndex + 1} / {options.length}
          </span>
          <button type="button" onClick={() => move(1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default PhraseHandoff;
