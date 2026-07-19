import { useState } from "react";
import { EdgeLight } from "./edge-light";
import "./preview.css";

export default function EdgeLightPreview() {
  const [selected, setSelected] = useState(false);

  return (
    <EdgeLight className="tb-edge-light-preview">
      <div>
        <h2>Clarify the active project card at its edge.</h2>
        <p>
          Fine-pointer movement updates only the isolated border overlay.
          Touch remains static, and keyboard focus exposes the same boundary.
        </p>
      </div>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => setSelected((current) => !current)}
      >
        {selected ? "Project selected" : "Select project"}
      </button>
    </EdgeLight>
  );
}
