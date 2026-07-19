import { EditorialShutter } from "./editorial-shutter";
import "./preview.css";

export default function EditorialShutterPreview() {
  return (
    <div className="tb-editorial-shutter-preview">
      <EditorialShutter
        className="tb-editorial-shutter-preview__media"
        edge="left"
        decorativeMedia={
          <div className="tb-editorial-shutter-preview__scene">
            <span className="tb-editorial-shutter-preview__arc" />
          </div>
        }
      />
      <div className="tb-editorial-shutter-preview__copy">
        <h2>Reveal a decorative project image from its caption edge.</h2>
        <p>
          The crop settles in 380 milliseconds. The component accepts only
          inert decorative media, so no link or control can be hidden while the
          shutter is closed.
        </p>
      </div>
    </div>
  );
}
