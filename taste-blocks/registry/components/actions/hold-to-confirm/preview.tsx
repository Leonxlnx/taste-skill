import { useState } from "react";
import { HoldToConfirm } from "./hold-to-confirm";
import "./preview.css";

export default function HoldToConfirmPreview() {
  const [confirmations, setConfirmations] = useState(0);

  return (
    <div className="tb-hold-preview">
      <div className="tb-hold-preview__content">
        <HoldToConfirm onConfirm={() => setConfirmations((count) => count + 1)} />
        <p>
          {confirmations
            ? `Confirmed ${confirmations} time${confirmations === 1 ? "" : "s"} in this preview.`
            : "Hold with a pointer, or activate twice with a keyboard."}
        </p>
      </div>
    </div>
  );
}
