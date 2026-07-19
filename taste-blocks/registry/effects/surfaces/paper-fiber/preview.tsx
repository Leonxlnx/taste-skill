import { PaperFiber } from "./paper-fiber";
import "./preview.css";

export default function PaperFiberPreview() {
  return (
    <PaperFiber className="tb-paper-fiber-preview">
      <div>
        <h2>Add paper grain to an editorial introduction.</h2>
        <p>
          Layered CSS gradients create a warm fiber texture without an image
          request. The text remains ordinary HTML and the palette stays
          configurable.
        </p>
      </div>
      <p className="tb-paper-fiber-preview__note">
        CSS gradients · zero network requests
      </p>
    </PaperFiber>
  );
}
