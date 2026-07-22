"use client";

import { type ImgHTMLAttributes, useState } from "react";

interface DiscloseImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  doorClassName?: string;
  vertical?: boolean;
}

// Adapted from the verified Taste Blocks registry item animata-disclose-image.
export default function DiscloseImage({ className = "", doorClassName = "", onLoad, vertical = false, ...props }: DiscloseImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [run, setRun] = useState(0);
  const open = loaded && run % 2 === 0;
  return (
    <div className="disclose-shell">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} className={`disclose-image ${className}`} onLoad={(event) => { setLoaded(true); onLoad?.(event); }} />
      <span aria-hidden="true" className={`disclose-door ${vertical ? "door-top" : "door-left"} ${open ? "open" : ""} ${doorClassName}`} />
      <span aria-hidden="true" className={`disclose-door ${vertical ? "door-bottom" : "door-right"} ${open ? "open" : ""} ${doorClassName}`} />
      <button className="replay" type="button" onClick={() => setRun((value) => value + 1)} aria-label={open ? "Close product reveal" : "Reveal product photograph"}>{open ? "Close view" : "Reveal product"}</button>
    </div>
  );
}
