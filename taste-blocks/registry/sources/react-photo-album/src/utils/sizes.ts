import round from "./round";
import type { Photo, ResponsiveSizes } from "../types";

export default function srcSetAndSizes(
  photo: Photo,
  responsiveSizes: ResponsiveSizes | undefined,
  photoWidth: number,
  containerWidth: number,
  photosCount: number,
  spacing: number,
  padding: number,
) {
  let srcSet;
  let sizes;

  const calcSizes = (base: string) => {
    const gaps = spacing * (photosCount - 1) + 2 * padding * photosCount;
    return `calc((${base.match(/^\s*calc\((.*)\)\s*$/)?.[1] ?? base} - ${gaps}px) / ${round((containerWidth - gaps) / photoWidth, 5)})`;
  };

  const images = photo.srcSet;
  if (images && images.length > 0) {
    srcSet = images
      .concat(
        !images.some(({ width }) => width === photo.width)
          ? [{ src: photo.src, width: photo.width, height: photo.height }]
          : [],
      )
      .sort((first, second) => first.width - second.width)
      .map((image) => `${image.src} ${image.width}w`)
      .join(", ");
  }

  // always produce image `sizes` attribute (use case: NextJS image)
  if (responsiveSizes?.size) {
    // produce more accurate estimate when `sizes` attribute is present
    sizes = (responsiveSizes.sizes || [])
      .map(({ viewport, size }) => `${viewport} ${calcSizes(size)}`)
      .concat(calcSizes(responsiveSizes.size))
      .join(", ");
  } else {
    // produce rough approximation by default
    sizes = `${Math.ceil((photoWidth / containerWidth) * 100)}vw`;
  }

  return { srcSet, sizes };
}
