"use client";

import { useState } from "react";

// Adapted from Taste Blocks registry id: animata-disclose-image.
export default function DiscloseImage({ src, alt, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <button className={`disclose ${className}`} type="button" onClick={() => setOpen((value) => !value)} aria-label={`${open ? "Conceal" : "Reveal"} project image`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} onLoad={() => setOpen(true)} />
      <span aria-hidden="true" className={`door door-left ${open ? "is-open" : ""}`} />
      <span aria-hidden="true" className={`door door-right ${open ? "is-open" : ""}`} />
      <span className="image-action">{open ? "Close study" : "Open study"}</span>
    </button>
  );
}
