import { GalleryStage } from "./gallery-stage";
import "./preview.css";

export default function GalleryStagePreview() {
  return (
    <GalleryStage
      title="Let the work set the pace."
      items={[
        { caption: "Primary view for the work's defining image.", media: <div className="tb-gallery-preview-media" aria-hidden="true" /> },
        { caption: "A closer view of material or interface detail.", media: <div className="tb-gallery-preview-media" aria-hidden="true" /> },
        { caption: "A second context that changes scale or setting.", media: <div className="tb-gallery-preview-media" aria-hidden="true" /> },
        { caption: "A wide closing frame for sequence, environment, or motion.", media: <div className="tb-gallery-preview-media" aria-hidden="true" /> },
      ]}
    />
  );
}
