import { useState } from "react";
import { ExpandingActionGroup } from "./expanding-action-group";
import "./preview.css";

const actions = [
  { id: "save", label: "Save" },
  { id: "duplicate", label: "Duplicate" },
  { id: "copy-link", label: "Copy public link" },
  { id: "export", label: "Download source archive" },
];

export default function ExpandingActionGroupPreview() {
  const [selected, setSelected] = useState<string | null>(null);

  function selectAction(id: string) {
    setSelected(actions.find((action) => action.id === id)?.label ?? "Action");
  }

  return (
    <div className="tb-action-group-preview">
      <div className="tb-action-group-preview__content">
        <ExpandingActionGroup actions={actions} onAction={selectAction} />
        <p aria-live="polite">
          {selected ? `${selected} selected.` : "Choose an action."}
        </p>
      </div>
    </div>
  );
}
