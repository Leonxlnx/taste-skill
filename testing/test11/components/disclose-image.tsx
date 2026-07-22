"use client";

import { type ImgHTMLAttributes, useState } from "react";

interface DiscloseImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  doorClassName?: string;
  vertical?: boolean;
}

export default function DiscloseImage({ className = "", doorClassName = "", onLoad, vertical = false, ...props }: DiscloseImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const axis = vertical ? "vertical" : "horizontal";
  return (
    <div className="disclose-frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} onLoad={(event) => { setImageLoaded(true); onLoad?.(event); }} className={`disclose-image ${className}`} />
      <span aria-hidden="true" className={`disclose-door first ${axis} ${imageLoaded ? "open" : ""} ${doorClassName}`} />
      <span aria-hidden="true" className={`disclose-door second ${axis} ${imageLoaded ? "open" : ""} ${doorClassName}`} />
    </div>
  );
}
