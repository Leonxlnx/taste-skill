import type { Photo } from "../types";

export default function ratio({ width, height }: Pick<Photo, "width" | "height">) {
  const result = width / height;
  // fall back to square aspect ratio for impossible dimensions (e.g., zero height)
  return Number.isFinite(result) ? result : 1;
}
