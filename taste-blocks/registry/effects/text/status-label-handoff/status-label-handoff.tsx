"use client";

import { useEffect, useRef } from "react";
import "./status-label-handoff.css";

export type StatusLabelTone = "neutral" | "active" | "success" | "warning";

export interface StatusLabelHandoffProps {
  label: string;
  tone?: StatusLabelTone;
  className?: string;
}

export function StatusLabelHandoff({
  label,
  tone = "neutral",
  className = "",
}: StatusLabelHandoffProps) {
  const current = label.trim() || "Unknown status";
  const previous = useRef(current);
  const changed = previous.current !== current;
  const toneLabel: Record<StatusLabelTone, string> = {
    neutral: "neutral",
    active: "active",
    success: "successful",
    warning: "warning",
  };

  useEffect(() => {
    previous.current = current;
  }, [current]);

  return (
    <span
      className={`tb-status-label-handoff ${className}`.trim()}
      data-tone={tone}
      role="status"
      aria-live="polite"
    >
      <span className="tb-status-label-handoff__sr">
        Status: {current}. State tone: {toneLabel[tone]}.
      </span>
      <span className="tb-status-label-handoff__marker" aria-hidden="true" />
      <span className="tb-status-label-handoff__viewport" aria-hidden="true">
        <span
          className={changed ? "tb-status-label-handoff__new" : ""}
          key={current}
        >
          {current}
        </span>
      </span>
    </span>
  );
}

export default StatusLabelHandoff;
