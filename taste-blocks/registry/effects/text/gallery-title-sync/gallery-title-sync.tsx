"use client";

import { useId, useState, type CSSProperties } from "react";
import "./gallery-title-sync.css";

export interface GalleryTitleSyncItem {
  id: string;
  title: string;
  description: string;
  color: string;
}

export interface GalleryTitleSyncProps {
  heading: string;
  items: GalleryTitleSyncItem[];
  className?: string;
}

export function GalleryTitleSync({
  heading,
  items,
  className = "",
}: GalleryTitleSyncProps) {
  const headingId = useId();
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [hasChanged, setHasChanged] = useState(false);
  const active = items.find((item) => item.id === activeId) ?? items[0];

  if (!active) return null;

  function select(id: string) {
    setActiveId(id);
    setHasChanged(true);
  }

  const panelStyle = { "--tb-gallery-color": active.color } as CSSProperties;

  return (
    <section className={`tb-gallery-title-sync ${className}`.trim()} aria-labelledby={headingId}>
      <div className="tb-gallery-title-sync__layout">
        <div className="tb-gallery-title-sync__panel" style={panelStyle} aria-hidden="true">
          <div
            className={`tb-gallery-title-sync__copy${hasChanged ? " tb-gallery-title-sync__copy--changed" : ""}`}
            key={active.id}
          >
            <h3>{active.title}</h3>
            <p>{active.description}</p>
          </div>
        </div>
        <div className="tb-gallery-title-sync__index">
          <h2 id={headingId}>{heading}</h2>
          <div className="tb-gallery-title-sync__announce" aria-live="polite">
            Selected: {active.title}. {active.description}
          </div>
          <div
            className="tb-gallery-title-sync__items"
            role="group"
            aria-label={`${heading} items`}
          >
            {items.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={item.id === active.id}
                onClick={() => select(item.id)}
              >
                <span
                  className="tb-gallery-title-sync__swatch"
                  style={{ "--tb-gallery-swatch": item.color } as CSSProperties}
                  aria-hidden="true"
                />
                <span>{String(index + 1).padStart(2, "0")} · {item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GalleryTitleSync;
