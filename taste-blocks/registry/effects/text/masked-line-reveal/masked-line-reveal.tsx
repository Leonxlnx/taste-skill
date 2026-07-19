import type { CSSProperties } from "react";
import "./masked-line-reveal.css";

export interface MaskedLineRevealProps {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}

export function MaskedLineReveal({
  lines,
  as: Tag = "h2",
  className = "",
}: MaskedLineRevealProps) {
  const visibleLines = lines.map((line) => line.trim()).filter(Boolean);

  if (visibleLines.length === 0) return null;

  return (
    <Tag
      className={`tb-masked-line-reveal ${className}`.trim()}
      aria-label={visibleLines.join(" ")}
    >
      <span aria-hidden="true">
        {visibleLines.map((line, index) => (
          <span className="tb-masked-line-reveal__line" key={`${line}-${index}`}>
            <span
              className="tb-masked-line-reveal__text"
              style={{ "--tb-mlr-index": index } as CSSProperties}
            >
              {line}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

export default MaskedLineReveal;
