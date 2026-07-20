"use client"

import GooeySvgFilter from "@/registry/sources/fancy-components/components/fancy-gooey-svg-filter/gooey-svg-filter"

const filterId = "taste-blocks-gooey-preview"

export default function FancyGooeySvgFilterPreview() {
  return (
    <section className="grid justify-items-center gap-6">
      <GooeySvgFilter id={filterId} strength={12} />
      <div
        role="img"
        aria-label="Three overlapping colored circles joined by a gooey SVG filter"
        className="flex h-52 w-72 items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <span className="h-28 w-28 translate-x-8 rounded-full bg-[#ff5c35]" />
        <span className="h-36 w-36 rounded-full bg-[#171717]" />
        <span className="h-24 w-24 -translate-x-7 rounded-full bg-[#4c6fff]" />
      </div>
      <p className="max-w-xs text-center text-sm text-neutral-600">
        The shipped export defines the filter; the preview supplies the shapes.
      </p>
    </section>
  )
}
