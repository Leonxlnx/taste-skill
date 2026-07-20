import { forwardRef, useMemo } from "react";

import { useContainerWidth } from "../hooks";
import StaticPhotoAlbum from "../../static";
import resolveRowsProps from "./resolveRowsProps";
import computeRowsLayout from "../../layouts/rows";
import type { ElementRef, ForwardedRef, JSXElement, Photo, RowsPhotoAlbumProps } from "../../types";

function RowsPhotoAlbum<TPhoto extends Photo>(
  { photos, breakpoints, defaultContainerWidth, ...rest }: RowsPhotoAlbumProps<TPhoto>,
  ref: ForwardedRef,
) {
  const { containerRef, containerWidth } = useContainerWidth(ref, breakpoints, defaultContainerWidth);

  const { spacing, padding, targetRowHeight, minPhotos, maxPhotos, ...restProps } = resolveRowsProps(containerWidth, {
    photos,
    ...rest,
  });

  const model = useMemo(
    () =>
      containerWidth !== undefined && spacing !== undefined && padding !== undefined && targetRowHeight !== undefined
        ? computeRowsLayout(photos, spacing, padding, containerWidth, targetRowHeight, minPhotos, maxPhotos)
        : undefined,
    [photos, spacing, padding, containerWidth, targetRowHeight, minPhotos, maxPhotos],
  );

  return <StaticPhotoAlbum layout="rows" ref={containerRef} model={model} {...restProps} />;
}

export default forwardRef(RowsPhotoAlbum) as <TPhoto extends Photo>(
  props: RowsPhotoAlbumProps<TPhoto> & ElementRef,
) => JSXElement;
