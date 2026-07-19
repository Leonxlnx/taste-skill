import { ObjectStageHero } from "./object-stage-hero";
import "./preview.css";

export default function ObjectStageHeroPreview() {
  return (
    <ObjectStageHero
      title="Give the object the room."
      description="Use one clear message beside the product, artwork, or interface that carries the page."
      actionLabel="View the object"
      actionHref="#/blocks"
      headingLevel={3}
      media={<div className="tb-object-stage-preview-media" aria-hidden="true"><span /></div>}
    />
  );
}
