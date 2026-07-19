import { DirectionalLink } from "./directional-link";
import "./preview.css";

export default function DirectionalLinkPreview() {
  return (
    <div className="tb-directional-link-preview">
      <DirectionalLink href="#/blocks" direction="forward">
        Browse the collection
      </DirectionalLink>
      <DirectionalLink href="#/" direction="back">
        Return to overview
      </DirectionalLink>
      <DirectionalLink href="/registry.json" direction="download" download>
        Download the registry
      </DirectionalLink>
    </div>
  );
}
