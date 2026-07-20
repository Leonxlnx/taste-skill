import { resolveCommonProps, resolveResponsiveParameter } from "../../utils";
import type { ComponentsProps, MasonryPhotoAlbumProps, Photo, Render, ResolvedNumber } from "../../types";

type ResolvedMasonryProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = Omit<
  MasonryPhotoAlbumProps<TPhoto>,
  "columns" | "spacing" | "padding" | "componentsProps" | "render"
> & {
  spacing: ResolvedNumber<TWidth>;
  padding: ResolvedNumber<TWidth>;
  columns: ResolvedNumber<TWidth>;
  componentsProps: ComponentsProps<TPhoto>;
  render: Render<TPhoto> | undefined;
};

export default function resolveMasonryProps<TPhoto extends Photo>(
  containerWidth: number,
  props: MasonryPhotoAlbumProps<TPhoto>,
): ResolvedMasonryProps<TPhoto, number>;

export default function resolveMasonryProps<TPhoto extends Photo>(
  containerWidth: number | undefined,
  props: MasonryPhotoAlbumProps<TPhoto>,
): ResolvedMasonryProps<TPhoto>;

export default function resolveMasonryProps<TPhoto extends Photo>(
  containerWidth: number | undefined,
  { columns, ...rest }: MasonryPhotoAlbumProps<TPhoto>,
) {
  return {
    ...rest,
    ...resolveCommonProps(containerWidth, rest),
    columns: resolveResponsiveParameter(columns, containerWidth, [5, 4, 3, 2], 1),
  };
}
