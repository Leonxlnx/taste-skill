"use client";

import { useState } from "react";

// Adapted from the verified Taste Blocks registry item `animata-disclose-image`.
export default function DiscloseImage({ src, alt }) {
  const [open, setOpen] = useState(false);

  return (
    <figure className="disclose">
      <img src={src} alt={alt} onLoad={() => setOpen(true)} />
      <span aria-hidden="true" className={`door door-left ${open ? "open" : ""}`} />
      <span aria-hidden="true" className={`door door-right ${open ? "open" : ""}`} />
      <button type="button" onClick={() => setOpen((value) => !value)} aria-pressed={!open}>
        {open ? "Close the shutters" : "Open to the weather"}
      </button>
    </figure>
  );
}
