import { EditorialStatementHero } from "./editorial-statement-hero";

export default function EditorialStatementHeroPreview() {
  return (
    <EditorialStatementHero
      title="Clear work needs a clear opening."
      summary="Lead with the point of view when the message is stronger than a decorative product frame."
      linkLabel="Read the approach"
      linkHref="#/docs"
      headingLevel={3}
    />
  );
}
