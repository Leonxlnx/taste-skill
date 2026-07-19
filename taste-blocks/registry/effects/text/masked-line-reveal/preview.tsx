import { MaskedLineReveal } from "./masked-line-reveal";
import "./preview.css";

export default function MaskedLineRevealPreview() {
  return (
    <div className="tb-masked-line-reveal-preview">
      <MaskedLineReveal lines={["Reveal lines.", "Keep text clear."]} />
    </div>
  );
}
