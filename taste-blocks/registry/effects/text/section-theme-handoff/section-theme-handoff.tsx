"use client";

import { useState, type CSSProperties } from "react";
import "./section-theme-handoff.css";

export interface SectionThemeChapter {
  id: string;
  title: string;
  summary: string;
  background: string;
  foreground: string;
  accent: string;
}

export interface SectionThemeHandoffProps {
  chapters: SectionThemeChapter[];
  navigationLabel?: string;
  className?: string;
}

export function SectionThemeHandoff({
  chapters,
  navigationLabel = "Story chapters",
  className = "",
}: SectionThemeHandoffProps) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const active = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];

  if (!active) return null;

  const theme = {
    "--tb-theme-bg": active.background,
    "--tb-theme-fg": active.foreground,
    "--tb-theme-accent": active.accent,
  } as CSSProperties;

  return (
    <section
      className={`tb-section-theme-handoff ${className}`.trim()}
      style={theme}
    >
      <div className="tb-section-theme-handoff__layout">
        <div
          className="tb-section-theme-handoff__nav"
          role="group"
          aria-label={navigationLabel}
        >
          {chapters.map((chapter, index) => (
            <button
              type="button"
              key={chapter.id}
              aria-pressed={chapter.id === active.id}
              onClick={() => setActiveId(chapter.id)}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{chapter.title}</span>
            </button>
          ))}
        </div>
        <div
          className="tb-section-theme-handoff__content"
          key={active.id}
          aria-live="polite"
        >
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
        </div>
      </div>
    </section>
  );
}

export default SectionThemeHandoff;
