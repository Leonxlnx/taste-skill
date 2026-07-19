import { PhraseHandoff } from "./phrase-handoff";
import "./preview.css";

export default function PhraseHandoffPreview() {
  return (
    <div className="tb-phrase-handoff-preview">
      <PhraseHandoff
        prefix="This handoff preserves"
        phrases={["reading order.", "focus order.", "the current state."]}
      />
    </div>
  );
}
