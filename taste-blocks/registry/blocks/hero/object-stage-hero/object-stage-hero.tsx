import type { ElementType, ReactNode } from "react";
import "./object-stage-hero.css";

export interface ObjectStageHeroProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  media?: ReactNode;
  mediaLabel?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function ObjectStageHero({
  title,
  description,
  actionLabel,
  actionHref,
  media,
  mediaLabel,
  headingLevel = 1,
}: ObjectStageHeroProps) {
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section className="tb-object-stage">
      <div className="tb-object-stage__copy">
        <Heading className="tb-object-stage__title">{title}</Heading>
        <p>{description}</p>
        <a className="tb-object-stage__action" href={actionHref}>
          {actionLabel}
        </a>
      </div>
      <div className="tb-object-stage__media">
        {media ?? (
          <div
            className="tb-object-stage__placeholder"
            role={mediaLabel ? "img" : undefined}
            aria-label={mediaLabel}
            aria-hidden={mediaLabel ? undefined : true}
          />
        )}
      </div>
    </section>
  );
}
