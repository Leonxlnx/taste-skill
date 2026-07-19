import { GalleryTitleSync } from "./gallery-title-sync";
import "./preview.css";

const projects = [
  {
    id: "material",
    title: "Material study",
    description: "Sample study of paper, ink, and binding choices for a small publication.",
    color: "#c6d6b5",
  },
  {
    id: "publication",
    title: "Publication system",
    description: "Sample layout system for long-form reading across print and responsive screens.",
    color: "#e9a34c",
  },
  {
    id: "wayfinding",
    title: "Wayfinding notes",
    description: "Sample signage study built around clear routes, names, and viewing distance.",
    color: "#b9c8e8",
  },
];

export default function GalleryTitleSyncPreview() {
  return (
    <div className="tb-gallery-title-sync-preview">
      <GalleryTitleSync heading="Sample project gallery" items={projects} />
    </div>
  );
}
