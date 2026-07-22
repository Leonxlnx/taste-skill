"use client";

import { useState } from "react";

// Adapted from the verified @taste/animata-disclose-image registry source.
export default function DiscloseImage({ src, alt, vertical = false }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="disclose">
      <img src={src} alt={alt} onLoad={() => setLoaded(true)} />
      <i aria-hidden="true" className={`${vertical ? "door top" : "door left"} ${loaded ? "open" : ""}`} />
      <i aria-hidden="true" className={`${vertical ? "door bottom" : "door right"} ${loaded ? "open" : ""}`} />
    </div>
  );
}
