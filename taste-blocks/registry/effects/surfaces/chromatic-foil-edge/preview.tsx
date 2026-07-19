import { useState } from "react";
import { ChromaticFoilEdge } from "./chromatic-foil-edge";
import "./preview.css";

export default function ChromaticFoilEdgePreview() {
  const [saved, setSaved] = useState(false);

  return (
    <ChromaticFoilEdge className="tb-chromatic-foil-edge-preview">
      <div>
        <h2>Mark a project card with one spectral edge.</h2>
        <p>
          Hover or keyboard focus fades in a one-pixel foil boundary. The card
          content stays fixed and only the isolated edge changes.
        </p>
      </div>
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => setSaved((current) => !current)}
      >
        {saved ? "Saved to shortlist" : "Save to shortlist"}
      </button>
    </ChromaticFoilEdge>
  );
}
