import { ContourRelief } from "./contour-relief";
import "./preview.css";

export default function ContourReliefPreview() {
  return (
    <ContourRelief className="tb-contour-relief-preview">
      <div className="tb-contour-relief-preview__copy">
        <h2>Frame a service introduction with static contours.</h2>
        <p>
          Twelve inline SVG paths add depth behind the copy. They scale with
          the surface, require no image request, and never enter an animation
          loop.
        </p>
      </div>
    </ContourRelief>
  );
}
