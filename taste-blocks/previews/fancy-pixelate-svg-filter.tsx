"use client"

import PixelateSvgFilter from "@/registry/sources/fancy-components/components/fancy-pixelate-svg-filter/pixelate-svg-filter"

const filterId = "taste-blocks-pixelate-preview"

export default function FancyPixelateSvgFilterPreview() {
  return (
    <section className="grid justify-items-center gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <PixelateSvgFilter id={filterId} size={12} crossLayers />
        <div
          className="grid h-56 w-72 place-items-center rounded-2xl bg-[radial-gradient(circle_at_25%_25%,#ff7356_0_18%,transparent_19%),radial-gradient(circle_at_72%_35%,#5875ff_0_24%,transparent_25%),linear-gradient(135deg,#f7e8ce,#c9e6dc)]"
          style={{ filter: `url(#${filterId})` }}
        >
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-900">
            Pixelate
          </span>
        </div>
      </div>
      <p className="max-w-xs text-center text-sm text-neutral-600">
        Browsers without this SVG filter keep the caller content visible.
      </p>
    </section>
  )
}
