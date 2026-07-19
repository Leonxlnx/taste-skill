import { useState } from "react";
import {
  StatusLabelHandoff,
  type StatusLabelTone,
} from "./status-label-handoff";
import "./preview.css";

const states: { label: string; tone: StatusLabelTone }[] = [
  { label: "Draft", tone: "neutral" },
  { label: "In review", tone: "active" },
  { label: "Approved", tone: "success" },
];

export default function StatusLabelHandoffPreview() {
  const [selected, setSelected] = useState(0);
  const status = states[selected];

  return (
    <div className="tb-status-label-handoff-preview">
      <StatusLabelHandoff label={status.label} tone={status.tone} />
      <fieldset>
        <legend>Review status</legend>
        <div className="tb-status-label-handoff-preview__options">
          {states.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
