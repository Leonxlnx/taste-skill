"use client"

"use client"

import { useRef } from "react"

import BoxCarousel, {
  type BoxCarouselRef,
  type CarouselItem,
} from "@/registry/sources/fancy-components/components/fancy-box-carousel/box-carousel"

const tile = (label: string, background: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 420"><rect width="560" height="420" fill="${background}"/><circle cx="450" cy="70" r="120" fill="white" fill-opacity=".12"/><circle cx="80" cy="370" r="150" fill="black" fill-opacity=".1"/><text x="36" y="370" fill="white" font-family="system-ui,sans-serif" font-size="54" font-weight="700">${label}</text></svg>`
  )}`

const items: CarouselItem[] = [
  { id: "one", type: "image", src: tile("ONE", "#e05f45"), alt: "Warm red abstract tile labeled one" },
  { id: "two", type: "image", src: tile("TWO", "#315a78"), alt: "Blue abstract tile labeled two" },
  { id: "three", type: "image", src: tile("THREE", "#4f7358"), alt: "Green abstract tile labeled three" },
  { id: "four", type: "image", src: tile("FOUR", "#705177"), alt: "Purple abstract tile labeled four" },
]

export default function FancyBoxCarouselPreview() {
  const carousel = useRef<BoxCarouselRef>(null)

  return (
    <section className="grid justify-items-center gap-5">
      <p id="carousel-instructions" className="max-w-sm text-center text-sm text-neutral-600">
        Focus the carousel and use the arrow keys, drag it, or use the controls.
      </p>
      <BoxCarousel ref={carousel} items={items} width={280} height={210} />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => carousel.current?.prev()}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => carousel.current?.next()}
        >
          Next
        </button>
      </div>
    </section>
  )
}
