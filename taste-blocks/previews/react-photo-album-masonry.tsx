"use client"

"use client"

import MasonryPhotoAlbum from "@/registry/sources/react-photo-album/src/client/masonry"
import "@/registry/sources/react-photo-album/src/styles/modules/common.css"
import "@/registry/sources/react-photo-album/src/styles/modules/masonry.css"

const colorPhotos = [
  ["#18212b", "#d7ff64", 1200, 800],
  ["#f0ebe3", "#ff5c35", 900, 1200],
  ["#24203c", "#a993ff", 1400, 900],
  ["#e8f0ff", "#2962ff", 1000, 1000],
  ["#1b3129", "#87e8b4", 800, 1100],
  ["#f9e4dc", "#c63c27", 1300, 760],
  ["#182b43", "#77c8ff", 940, 1200],
  ["#f1efc8", "#53622c", 1500, 920],
].map(([background, accent, width, height], index) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="${background}"/><circle cx="${220 + (index % 3) * 260}" cy="${190 + (index % 2) * 360}" r="180" fill="${accent}"/><path d="M0 ${720 - index * 25}L1200 ${260 + index * 34}V900H0Z" fill="${accent}" opacity=".42"/></svg>`
  return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, width: Number(width), height: Number(height), alt: `Abstract color composition ${index + 1}` }
})

export default function ReactPhotoAlbumMasonryPreview() {
  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-neutral-950 p-3">
      <MasonryPhotoAlbum photos={colorPhotos} defaultContainerWidth={960} spacing={10} />
    </div>
  )
}
