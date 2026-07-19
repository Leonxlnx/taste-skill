import type { ElementType, ReactNode } from "react";
import "./live-experience-hero.css";

export interface LiveExperienceHeroProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  /** Decorative media only. Interactive controls belong outside this block. */
  media?: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function LiveExperienceHero({
  title,
  description,
  actionLabel,
  actionHref,
  media,
  headingLevel = 1,
}: LiveExperienceHeroProps) {
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section className="tb-live-hero">
      <div className="tb-live-hero__media" aria-hidden="true" inert>
        {media ?? (
          <div className="tb-live-hero__placeholder" />
        )}
      </div>
      <div className="tb-live-hero__scrim" aria-hidden="true" />
      <div className="tb-live-hero__copy">
        <Heading className="tb-live-hero__title">{title}</Heading>
        <p>{description}</p>
        <a href={actionHref}>{actionLabel}</a>
      </div>
    </section>
  );
}
