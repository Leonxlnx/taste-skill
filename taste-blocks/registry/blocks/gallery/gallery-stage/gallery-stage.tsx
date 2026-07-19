import type { ReactNode } from "react";
import "./gallery-stage.css";

export interface GalleryStageItem {
  caption: string;
  mediaLabel?: string;
  media?: ReactNode;
}

export interface GalleryStageProps {
  title: string;
  items: GalleryStageItem[];
}

export function GalleryStage({ title, items }: GalleryStageProps) {
  return (
    <section className="tb-gallery-stage">
      <h2>{title}</h2>
      <div className="tb-gallery-stage__grid">
        {items.map((item) => (
          <figure key={`${item.caption}-${item.mediaLabel}`}>
            <div className="tb-gallery-stage__media">
              {item.media ?? (
                <div
                  className="tb-gallery-stage__placeholder"
                  role={item.mediaLabel ? "img" : undefined}
                  aria-label={item.mediaLabel}
                  aria-hidden={item.mediaLabel ? undefined : true}
                />
              )}
            </div>
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
