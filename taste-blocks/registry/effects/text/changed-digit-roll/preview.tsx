import { useState } from "react";
import { ChangedDigitRoll } from "./changed-digit-roll";
import "./preview.css";

export default function ChangedDigitRollPreview() {
  const [budget, setBudget] = useState(2400);

  return (
    <div className="tb-changed-digit-roll-preview">
      <div>
        <p>Example monthly budget</p>
        <output>
          <ChangedDigitRoll value={budget} label="Example monthly budget" prefix="$" />
        </output>
      </div>
      <div className="tb-changed-digit-roll-preview__controls" role="group" aria-label="Adjust example budget">
        <button type="button" onClick={() => setBudget((value) => Math.max(500, value - 500))}>
          Decrease by $500
        </button>
        <button type="button" onClick={() => setBudget((value) => Math.min(8000, value + 500))}>
          Increase by $500
        </button>
      </div>
    </div>
  );
}
