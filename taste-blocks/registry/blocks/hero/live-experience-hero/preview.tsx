import { LiveExperienceHero } from "./live-experience-hero";
import "./preview.css";

export default function LiveExperienceHeroPreview() {
  return (
    <LiveExperienceHero
      title="Let the experience lead."
      description="Use full-frame media when movement, atmosphere, or place is central to understanding the work."
      actionLabel="Enter the story"
      actionHref="#/blocks"
      headingLevel={3}
      media={<div className="tb-live-hero-preview-media" aria-hidden="true"><span /></div>}
    />
  );
}
