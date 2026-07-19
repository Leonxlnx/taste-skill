import { useState } from "react";
import { PressDepthButton } from "./press-depth-button";
import "./preview.css";

export default function PressDepthButtonPreview() {
  const [pinned, setPinned] = useState(false);

  return (
    <div className="tb-press-depth-preview">
      <div className="tb-press-depth-preview__content">
        <PressDepthButton
          aria-pressed={pinned}
          onClick={() => setPinned((value) => !value)}
        >
          {pinned ? "Selection pinned" : "Pin selection"}
        </PressDepthButton>
        <p aria-live="polite">{pinned ? "Pinned in this preview." : "Not pinned."}</p>
      </div>
    </div>
  );
}
