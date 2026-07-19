import type { ReactNode } from "react";
import "./editorial-shutter.css";

interface EditorialShutterProps {
  className?: string;
  /** Decorative, non-interactive media only; rendered inert and aria-hidden. */
  decorativeMedia: ReactNode;
  edge?: "left" | "right";
}

export function EditorialShutter({
  className = "",
  decorativeMedia,
  edge = "left",
}: EditorialShutterProps) {
  return (
    <div
      className={`tb-editorial-shutter ${className}`.trim()}
      data-edge={edge}
    >
      <div
        className="tb-editorial-shutter__frame"
        aria-hidden="true"
        inert
      >
        {decorativeMedia}
      </div>
    </div>
  );
}
