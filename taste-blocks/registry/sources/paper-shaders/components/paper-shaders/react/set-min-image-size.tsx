/**
 * Resize the image to at least 1024px on the shorter side.
 * Makes sure that vector images are converted to bitmaps at an acceptable resolution.
 */
export function setMinImageSize(img: HTMLImageElement): void {
  if (img.naturalWidth < 1024 && img.naturalHeight < 1024) {
    if (img.naturalWidth < 1 || img.naturalHeight < 1) {
      // Skip weird sizes
      return;
    }

    const aspect = img.naturalWidth / img.naturalHeight;
    img.width = Math.round(aspect > 1 ? 1024 * aspect : 1024);
    img.height = Math.round(aspect > 1 ? 1024 : 1024 / aspect);
  }
}
