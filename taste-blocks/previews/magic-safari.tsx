"use client"

import { Safari } from "@/registry/sources/magic-ui/components/magic-safari/safari"

const previewImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 700'%3E%3Crect width='1200' height='700' fill='%23171717'/%3E%3Ccircle cx='880' cy='120' r='360' fill='%237c3aed'/%3E%3Ccircle cx='260' cy='620' r='300' fill='%23fb7185'/%3E%3Crect x='120' y='120' width='960' height='460' rx='36' fill='%23fafafa' fill-opacity='.9'/%3E%3C/svg%3E"

export default function MagicSafariPreview() {
  return (
    <figure className="w-full max-w-5xl">
      <Safari url="tasteblocks.dev" imageSrc={previewImage} />
      <figcaption className="sr-only">Safari browser mockup preview</figcaption>
    </figure>
  )
}
