import { DitherAperture } from "./dither-aperture";
import "./preview.css";

export default function DitherAperturePreview() {
  return (
    <DitherAperture className="tb-dither-aperture-preview" focus="72% 44%">
      <div className="tb-dither-aperture-preview__scene" aria-hidden="true">
        <span className="tb-dither-aperture-preview__disc" />
        <span className="tb-dither-aperture-preview__bar" />
      </div>
      <div className="tb-dither-aperture-preview__copy">
        <h2>Clear the product while dithering the crop edges.</h2>
        <p>
          The ordered-dot veil fades around a supplied focal point. A default
          16:9 aspect ratio keeps the installed component visible in normal
          flow.
        </p>
      </div>
    </DitherAperture>
  );
}
