/**
 * Split-Flap Panel — a CSS-3D recreation of Solari-style departure boards.
 * Built by Cody Shanley · https://codyshanley.com/playground/split-flap?utm_source=github&utm_medium=attribution&utm_campaign=split-flap
 * MIT licensed. Free to use, modify, and redistribute.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SplitFlapSlat } from "./split-flap-slat";
import "./split-flap.css";

interface Props {
  words: string[];
  /** The deterministic initial word. Defaults to the first word. */
  anchorWord?: string;
  slotCount?: number;
  stepMs?: number;
  slotStaggerMs?: number;
  size?: "default" | "xl" | "compact" | "hero";
  /** When this number changes, advance immediately to the next word. */
  refreshSignal?: number;
  /** Announce each word after every slat has settled. */
  announce?: boolean;
}

function padToSlots(word: string, slotCount: number): string[] {
  const chars = Array.from(word.toUpperCase());
  return Array.from({ length: slotCount }, (_, index) => chars[index] ?? " ");
}

function nextWord(words: string[], current: string): string {
  if (words.length === 0) return current;
  return words[(words.indexOf(current) + 1) % words.length] ?? current;
}

function semanticWord(word: string, slotCount: number): string {
  return Array.from(word).slice(0, slotCount).join("").trimEnd();
}

export function SplitFlapDisplay({
  words,
  anchorWord,
  slotCount = 8,
  stepMs = 110,
  slotStaggerMs = 40,
  size = "default",
  refreshSignal,
  announce = false,
}: Props) {
  const normalizedSlotCount = Number.isFinite(slotCount)
    ? Math.max(0, Math.floor(slotCount))
    : 8;
  const initialWord = useRef(anchorWord ?? words[0] ?? "").current;
  const [currentWord, setCurrentWord] = useState(initialWord);
  const [initialLetters] = useState(() => padToSlots(initialWord, normalizedSlotCount));
  const [settledWord, setSettledWord] = useState(() =>
    semanticWord(initialWord, normalizedSlotCount),
  );
  const previousRefreshSignal = useRef(refreshSignal);

  useEffect(() => {
    if (Object.is(refreshSignal, previousRefreshSignal.current)) return;
    previousRefreshSignal.current = refreshSignal;
    setCurrentWord((current) => nextWord(words, current));
  }, [refreshSignal, words]);

  const targets = useMemo(
    () => padToSlots(currentWord, normalizedSlotCount),
    [currentWord, normalizedSlotCount],
  );
  const targetsRef = useRef(targets);
  const currentWordRef = useRef(currentWord);
  const settledTargetsRef = useRef([...targets]);
  targetsRef.current = targets;
  currentWordRef.current = currentWord;

  const handleSlatSettled = useCallback((index: number, target: string) => {
    const activeTargets = targetsRef.current;
    if (activeTargets[index] !== target) return;
    settledTargetsRef.current[index] = target;
    if (activeTargets.every((character, position) => settledTargetsRef.current[position] === character)) {
      setSettledWord(semanticWord(currentWordRef.current, activeTargets.length));
    }
  }, []);

  useEffect(() => {
    if (targets.every((character, index) => settledTargetsRef.current[index] === character)) {
      setSettledWord(semanticWord(currentWord, targets.length));
    }
  }, [currentWord, targets]);

  return (
    <span className="splitflap-display">
      <span
        className="splitflap-sr-only"
        role={announce ? "status" : undefined}
        aria-live={announce ? "polite" : "off"}
        aria-atomic={announce ? "true" : undefined}
      >
        {settledWord}
      </span>
      {targets.map((target, index) => (
        <SplitFlapSlat
          key={index}
          target={target}
          initialCurrent={initialLetters[index] ?? " "}
          stepMs={stepMs}
          startDelayMs={index * slotStaggerMs}
          minFlips={1}
          size={size}
          onSettled={(settledTarget) => handleSlatSettled(index, settledTarget)}
        />
      ))}
    </span>
  );
}
