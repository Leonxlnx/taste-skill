import { SharedNavMarker } from "./shared-nav-marker";
import "./preview.css";

const links = [
  { label: "Overview", href: "#/" },
  { label: "Blocks", href: "#/blocks" },
  { label: "Sources", href: "#/sources" },
  { label: "Rules", href: "#/rules" },
];

export default function SharedNavMarkerPreview() {
  return (
    <div className="tb-shared-nav-marker-preview">
      <SharedNavMarker items={links} activeHref="#/blocks" label="Taste Blocks pages" />
    </div>
  );
}
