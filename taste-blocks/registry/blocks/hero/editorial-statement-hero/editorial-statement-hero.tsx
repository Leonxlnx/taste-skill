import type { ElementType } from "react";
import "./editorial-statement-hero.css";

export interface EditorialStatementHeroProps {
  title: string;
  summary: string;
  linkLabel: string;
  linkHref: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function EditorialStatementHero({
  title,
  summary,
  linkLabel,
  linkHref,
  headingLevel = 1,
}: EditorialStatementHeroProps) {
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <section className="tb-editorial-hero">
      <div className="tb-editorial-hero__frame">
        <Heading className="tb-editorial-hero__title">{title}</Heading>
        <div className="tb-editorial-hero__close">
          <p>{summary}</p>
          <a href={linkHref}>{linkLabel}</a>
        </div>
      </div>
    </section>
  );
}
