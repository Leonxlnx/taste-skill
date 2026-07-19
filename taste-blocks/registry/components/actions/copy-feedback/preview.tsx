import { CopyFeedback } from "./copy-feedback";
import "./preview.css";

export default function CopyFeedbackPreview() {
  return (
    <div className="tb-copy-preview">
      <CopyFeedback value="npm install motion" />
    </div>
  );
}
