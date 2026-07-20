import type React from "react";
import { forwardRef } from "react";

import Component from "./Component";
import PhotoComponent from "./PhotoComponent";
import { srcSetAndSizes, unwrap } from "../utils";
import type { CommonPhotoAlbumProps, ComponentsProps, ElementRef, LayoutModel, Photo, Render } from "../types";

export type StaticPhotoAlbumProps<TPhoto extends Photo> = Pick<
  CommonPhotoAlbumProps<TPhoto>,
  "sizes" | "onClick" | "skeleton"
> & {
  layout?: string;
  model?: LayoutModel<TPhoto>;
  render?: Render<TPhoto>;
  componentsProps?: ComponentsProps<TPhoto>;
};

function StaticPhotoAlbum<TPhoto extends Photo>(
  {
    layout,
    sizes,
    model,
    skeleton,
    onClick: onClickCallback,
    render: { container, track, photo: renderPhoto, ...restRender } = {},
    componentsProps: {
      container: containerProps,
      track: trackProps,
      link: linkProps,
      button: buttonProps,
      wrapper: wrapperProps,
      image: imageProps,
    } = {},
  }: StaticPhotoAlbumProps<TPhoto>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const { spacing, padding, containerWidth, tracks, variables, horizontal } = model || {};

  return (
    <Component
      role="group"
      aria-label="Photo album"
      {...containerProps}
      variables={{ spacing, padding, containerWidth, ...variables }}
      classes={["", layout]}
      render={container}
      ref={ref}
    >
      {spacing !== undefined &&
        padding !== undefined &&
        containerWidth !== undefined &&
        tracks?.map(({ photos, variables: trackVariables }, trackIndex) => {
          const trackSize = photos.length;
          const photosCount = horizontal ? trackSize : tracks.length;

          return (
            <Component
              {...trackProps}
              key={trackIndex}
              render={track}
              classes="track"
              variables={{ trackSize, ...trackVariables }}
            >
              {photos.map((context) => {
                const { photo, index, width } = context;
                const { key, src, alt = "", title, label } = photo;

                const onClick = onClickCallback
                  ? (event: React.MouseEvent) => {
                      onClickCallback({ event, photo, index });
                    }
                  : undefined;

                if (renderPhoto) {
                  const rendered = renderPhoto({ onClick }, context);
                  if (rendered) return rendered;
                }

                const ariaLabel = <T extends object | undefined>(props: T) => {
                  return label ? { "aria-label": label, ...props } : props;
                };

                return (
                  <PhotoComponent
                    // index is always unique; src can collide when the same photo appears multiple times
                    key={key ?? index}
                    onClick={onClick}
                    render={restRender}
                    componentsProps={{
                      image: {
                        // loading="lazy" must precede src and srcSet
                        loading: "lazy" as const,
                        decoding: "async" as const,
                        src,
                        alt,
                        title,
                        ...srcSetAndSizes(photo, sizes, width, containerWidth, photosCount, spacing, padding),
                        ...unwrap(imageProps, context),
                      },
                      link: ariaLabel(unwrap(linkProps, context)),
                      button: ariaLabel(unwrap(buttonProps, context)),
                      wrapper: unwrap(wrapperProps, context),
                    }}
                    {...context}
                  />
                );
              })}
            </Component>
          );
        })}

      {containerWidth === undefined && skeleton}
    </Component>
  );
}

export default forwardRef(StaticPhotoAlbum) as <TPhoto extends Photo>(
  props: StaticPhotoAlbumProps<TPhoto> & ElementRef,
) => React.ReactNode;
