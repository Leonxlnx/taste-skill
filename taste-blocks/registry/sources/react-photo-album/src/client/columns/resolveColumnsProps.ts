import { resolveCommonProps, resolveResponsiveParameter } from "../../utils";
import type { ColumnsPhotoAlbumProps, ComponentsProps, Photo, Render, ResolvedNumber } from "../../types";

type ResolvedColumnsProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = Omit<
  ColumnsPhotoAlbumProps<TPhoto>,
  "columns" | "spacing" | "padding" | "componentsProps" | "render"
> & {
  spacing: ResolvedNumber<TWidth>;
  padding: ResolvedNumber<TWidth>;
  columns: ResolvedNumber<TWidth>;
  componentsProps: ComponentsProps<TPhoto>;
  render: Render<TPhoto> | undefined;
};

export default function resolveColumnsProps<TPhoto extends Photo>(
  containerWidth: number,
  props: ColumnsPhotoAlbumProps<TPhoto>,
): ResolvedColumnsProps<TPhoto, number>;

export default function resolveColumnsProps<TPhoto extends Photo>(
  containerWidth: number | undefined,
  props: ColumnsPhotoAlbumProps<TPhoto>,
): ResolvedColumnsProps<TPhoto>;

export default function resolveColumnsProps<TPhoto extends Photo>(
  containerWidth: number | undefined,
  { columns, ...rest }: ColumnsPhotoAlbumProps<TPhoto>,
) {
  return {
    ...rest,
    ...resolveCommonProps(containerWidth, rest),
    columns: resolveResponsiveParameter(columns, containerWidth, [5, 4, 3, 2], 1),
  };
}
