import type { CSSProperties, ReactNode } from "react";
import "./dither-aperture.css";

interface DitherApertureProps {
  aspectRatio?: CSSProperties["aspectRatio"];
  children: ReactNode;
  className?: string;
  focus?: string;
}

export function DitherAperture({
  aspectRatio = "16 / 9",
  children,
  className = "",
  focus = "70% 38%",
}: DitherApertureProps) {
  const style = {
    "--tb-dither-focus": focus,
    aspectRatio,
  } as CSSProperties;

  return (
    <div className={`tb-dither-aperture ${className}`.trim()} style={style}>
      <div className="tb-dither-aperture__media">{children}</div>
      <div className="tb-dither-aperture__veil" aria-hidden="true" />
    </div>
  );
}
