"use client";

import { useEffect, useRef } from "react";
import "./changed-digit-roll.css";

export interface ChangedDigitRollProps {
  value: number;
  label: string;
  locale?: string;
  maximumFractionDigits?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function ChangedDigitRoll({
  value,
  label,
  locale = "en-US",
  maximumFractionDigits = 0,
  prefix = "",
  suffix = "",
  className = "",
}: ChangedDigitRollProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits });
  const formatted = formatter.format(safeValue);
  const previousText = useRef(formatted);
  const previousValue = useRef(safeValue);
  const prior = previousText.current;
  const direction = safeValue >= previousValue.current ? "up" : "down";
  const width = Math.max(prior.length, formatted.length);
  const oldCharacters = prior.padStart(width, "\u00a0").split("");
  const newCharacters = formatted.padStart(width, "\u00a0").split("");

  useEffect(() => {
    previousText.current = formatted;
    previousValue.current = safeValue;
  }, [formatted, safeValue]);

  return (
    <span
      className={`tb-changed-digit-roll ${className}`.trim()}
      data-direction={direction}
    >
      <span className="tb-changed-digit-roll__sr" role="status" aria-live="polite">
        {label}: {prefix}{formatted}{suffix}
      </span>
      <span className="tb-changed-digit-roll__visual" aria-hidden="true">
        {prefix ? <span>{prefix}</span> : null}
        {newCharacters.map((character, index) => {
          const oldCharacter = oldCharacters[index];
          const changed =
            character !== oldCharacter && /\d/.test(character) && /\d/.test(oldCharacter);

          return changed ? (
            <span
              className="tb-changed-digit-roll__character tb-changed-digit-roll__character--changed"
              key={`${formatted}-${index}-${character}`}
            >
              <span className="tb-changed-digit-roll__old">{oldCharacter}</span>
              <span className="tb-changed-digit-roll__new">{character}</span>
            </span>
          ) : (
            <span className="tb-changed-digit-roll__character" key={`${index}-${character}`}>
              {character}
            </span>
          );
        })}
        {suffix ? <span>{suffix}</span> : null}
      </span>
    </span>
  );
}

export default ChangedDigitRoll;
