import { DisclosureRow } from "./disclosure-row";
import "./preview.css";

export default function DisclosureRowPreview() {
  return (
    <div className="tb-disclosure-preview">
      <div className="tb-disclosure-preview__content">
        <DisclosureRow title="What ships with a block?" name="block-preview-faq">
          <p>Editable React source, scoped styles, a working preview, behavior notes, and provenance.</p>
        </DisclosureRow>
        <DisclosureRow title="Does it work without motion?" name="block-preview-faq">
          <p>Yes. Required state and content remain visible when motion is reduced or unavailable.</p>
        </DisclosureRow>
        <DisclosureRow title="Can the styles be changed?" name="block-preview-faq">
          <p>Yes. The scoped component classes can be edited to follow the surrounding brand.</p>
        </DisclosureRow>
      </div>
    </div>
  );
}
