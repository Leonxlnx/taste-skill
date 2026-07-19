"use client";

import { useId, useState } from "react";
import "./artifact-process.css";

export interface ArtifactPhase {
  title: string;
  description: string;
  artifactTitle: string;
  artifactDetails: string[];
}

export interface ArtifactProcessProps {
  title: string;
  phases: ArtifactPhase[];
}

export function ArtifactProcess({ title, phases }: ArtifactProcessProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelId = useId();
  const safeIndex = activeIndex < phases.length ? activeIndex : 0;
  const activePhase = phases[safeIndex];

  if (!activePhase) {
    return (
      <section className="tb-artifact-process">
        <h2>{title}</h2>
      </section>
    );
  }

  return (
    <section className="tb-artifact-process">
      <h2>{title}</h2>
      <div className="tb-artifact-process__layout">
        <div
          className="tb-artifact-process__artifact"
          data-phase={safeIndex % 3}
          id={panelId}
          role="region"
          aria-live="polite"
          aria-label={`Artifact for ${activePhase.title}`}
        >
          <div className="tb-artifact-process__sheets" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="tb-artifact-process__document">
            <strong>{activePhase.artifactTitle}</strong>
            <ul>
              {activePhase.artifactDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
        <ol className="tb-artifact-process__phases">
          {phases.map((phase, index) => (
            <li key={phase.title}>
              <button
                type="button"
                aria-controls={panelId}
                aria-pressed={index === safeIndex}
                onClick={() => setActiveIndex(index)}
              >
                <strong>{phase.title}</strong>
                <span>{phase.description}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
