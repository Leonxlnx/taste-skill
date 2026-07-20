import { forwardRef, useMemo } from "react";

import { useContainerWidth } from "../hooks";
import StaticPhotoAlbum from "../../static";
import resolveColumnsProps from "./resolveColumnsProps";
import computeColumnsLayout from "../../layouts/columns";
import type { ColumnsPhotoAlbumProps, ElementRef, ForwardedRef, JSXElement, Photo } from "../../types";

function ColumnsPhotoAlbum<TPhoto extends Photo>(
  { photos, breakpoints, defaultContainerWidth, ...rest }: ColumnsPhotoAlbumProps<TPhoto>,
  ref: ForwardedRef,
) {
  const { containerRef, containerWidth } = useContainerWidth(ref, breakpoints, defaultContainerWidth);

  const { spacing, padding, columns, ...restProps } = resolveColumnsProps(containerWidth, { photos, ...rest });

  const model = useMemo(
    () =>
      containerWidth !== undefined && spacing !== undefined && padding !== undefined && columns !== undefined
        ? computeColumnsLayout(photos, spacing, padding, containerWidth, columns)
        : undefined,
    [photos, spacing, padding, containerWidth, columns],
  );

  return <StaticPhotoAlbum layout="columns" ref={containerRef} model={model} {...restProps} />;
}

export default forwardRef(ColumnsPhotoAlbum) as <TPhoto extends Photo>(
  props: ColumnsPhotoAlbumProps<TPhoto> & ElementRef,
) => JSXElement;
