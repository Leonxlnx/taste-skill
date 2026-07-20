"use client";

import { useState } from "react";

import Lightbox from "@/registry/sources/yarl/components/yarl-lightbox/index";
import "@/registry/sources/yarl/components/yarl-lightbox/styles.css";

function image(label: string, background: string, accent: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${background}"/><circle cx="990" cy="130" r="260" fill="${accent}" opacity=".72"/><path d="M0 650C250 460 470 760 720 570s310-160 480-40v270H0Z" fill="${accent}" opacity=".36"/><text x="72" y="710" fill="white" font-family="system-ui,sans-serif" font-size="78" font-weight="650">${label}</text></svg>`,
  )}`;
}

const slides = [
  { src: image("Field study", "#17231d", "#7da980"), alt: "Green abstract field study", width: 1200, height: 800 },
  { src: image("Material", "#241b18", "#d9845c"), alt: "Terracotta abstract material study", width: 1200, height: 800 },
  { src: image("Structure", "#17202b", "#6e94bd"), alt: "Blue abstract structure study", width: 1200, height: 800 },
];

export default function YarlLightboxPreview() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-950 shadow-sm sm:p-6">
      <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl sm:gap-3">
        {slides.map((slide, index) => (
          <button
            aria-label={`Open image ${index + 1} of ${slides.length}: ${slide.alt}`}
            className="group min-h-24 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 sm:min-h-36"
            key={slide.alt}
            onClick={() => {
              setActiveIndex(index);
              setOpen(true);
            }}
            type="button"
          >
            <img
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none sm:group-hover:scale-[1.025]"
              height={slide.height}
              src={slide.src}
              width={slide.width}
            />
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">Keyboard, swipe, RTL, and reduced-motion aware.</p>
        <button
          className="min-h-11 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          onClick={() => setOpen(true)}
          type="button"
        >
          Open gallery
        </button>
      </div>

      <Lightbox
        close={() => setOpen(false)}
        index={activeIndex}
        on={{ view: ({ index }) => setActiveIndex(index) }}
        open={open}
        slides={slides}
      />
    </div>
  );
}
