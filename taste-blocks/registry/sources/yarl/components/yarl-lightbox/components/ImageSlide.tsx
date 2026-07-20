import * as React from "react";

import { CarouselSettings, ContainerRect, Render, SlideImage } from "../types.js";
import { clsx, cssClass, hasWindow, isImageFitCover, makeComposePrefix } from "../utils.js";
import { useEventCallback } from "../hooks/index.js";
import { useEvents, useTimeouts } from "../contexts/index.js";
import { ErrorIcon, LoadingIcon } from "./Icons.js";
import {
  activeSlideStatus,
  ELEMENT_ICON,
  SLIDE_STATUS_COMPLETE,
  SLIDE_STATUS_ERROR,
  SLIDE_STATUS_LOADING,
  SLIDE_STATUS_PLACEHOLDER,
  SlideStatus,
} from "../consts.js";

const slidePrefix = makeComposePrefix("slide");
const slideImagePrefix = makeComposePrefix("slide_image");

export type ImageSlideProps = Partial<Pick<CarouselSettings, "imageFit" | "imageProps">> & {
  slide: SlideImage;
  offset?: number;
  render?: Render;
  rect?: ContainerRect;
  onClick?: () => void;
  onLoad?: (image: HTMLImageElement) => void;
  onError?: () => void;
  style?: React.CSSProperties;
};

export function ImageSlide({
  slide: image,
  offset,
  render,
  rect,
  imageFit,
  imageProps,
  onClick,
  onLoad,
  onError,
  style,
}: ImageSlideProps) {
  const [status, setStatus] = React.useState<SlideStatus>(SLIDE_STATUS_LOADING);

  const { publish } = useEvents();
  const { setTimeout } = useTimeouts();

  const imageRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (offset === 0) {
      publish(activeSlideStatus(status));
    }
  }, [offset, status, publish]);

  const handleLoading = useEventCallback((img: HTMLImageElement) => {
    ("decode" in img ? img.decode() : Promise.resolve())
      .catch(() => {})
      .then(() => {
        if (!img.parentNode) {
          return;
        }
        setStatus(SLIDE_STATUS_COMPLETE);

        // this is a workaround for Zoom plugin's preload image swap
        // otherwise the 'complete' status does not get published
        setTimeout(() => {
          onLoad?.(img);
        }, 0);
      });
  });

  const setImageRef = React.useCallback(
    (img: HTMLImageElement | null) => {
      imageRef.current = img;

      if (img?.complete) {
        handleLoading(img);
      }
    },
    [handleLoading],
  );

  const handleOnLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      handleLoading(event.currentTarget);
    },
    [handleLoading],
  );

  const handleOnError = useEventCallback(() => {
    setStatus(SLIDE_STATUS_ERROR);

    onError?.();
  });

  const cover = isImageFitCover(image, imageFit);

  const nonInfinite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);

  const maxWidth = nonInfinite(
    Math.max(...(image.srcSet?.map((x) => x.width) ?? []).concat(image.width ? [image.width] : []).filter(Boolean)),
    imageRef.current?.naturalWidth || 0,
  );

  const maxHeight = nonInfinite(
    Math.max(...(image.srcSet?.map((x) => x.height) ?? []).concat(image.height ? [image.height] : []).filter(Boolean)),
    imageRef.current?.naturalHeight || 0,
  );

  const defaultStyle =
    maxWidth && maxHeight
      ? {
          maxWidth: `min(${maxWidth}px, 100%)`,
          maxHeight: `min(${maxHeight}px, 100%)`,
        }
      : {
          maxWidth: "100%",
          maxHeight: "100%",
        };

  const srcSet = image.srcSet
    ?.slice()
    .sort((a, b) => a.width - b.width)
    .map((item) => `${item.src} ${item.width}w`)
    .join(", ");

  const estimateActualWidth = () =>
    rect && !cover && image.width && image.height ? (rect.height / image.height) * image.width : Number.MAX_VALUE;

  const sizes =
    srcSet && rect && hasWindow() ? `${Math.round(Math.min(estimateActualWidth(), rect.width))}px` : undefined;

  const {
    style: imagePropsStyle,
    className: imagePropsClassName,
    ...restImageProps
  } = (typeof imageProps === "function" ? imageProps(image) : imageProps) || {};

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
      <img
        ref={setImageRef}
        onLoad={handleOnLoad}
        onError={handleOnError}
        onClick={onClick}
        draggable={false}
        className={clsx(
          cssClass(slideImagePrefix()),
          cover && cssClass(slideImagePrefix("cover")),
          status !== SLIDE_STATUS_COMPLETE && cssClass(slideImagePrefix("loading")),
          imagePropsClassName,
        )}
        style={{ ...defaultStyle, ...style, ...imagePropsStyle }}
        {...restImageProps}
        alt={image.alt ?? ""}
        sizes={sizes}
        srcSet={srcSet}
        src={image.src}
      />

      {status !== SLIDE_STATUS_COMPLETE && (
        <div className={cssClass(slidePrefix(SLIDE_STATUS_PLACEHOLDER))}>
          {status === SLIDE_STATUS_LOADING &&
            (render?.iconLoading ? (
              render.iconLoading()
            ) : (
              <LoadingIcon className={clsx(cssClass(ELEMENT_ICON), cssClass(slidePrefix(SLIDE_STATUS_LOADING)))} />
            ))}
          {status === SLIDE_STATUS_ERROR &&
            (render?.iconError ? (
              render.iconError()
            ) : (
              <ErrorIcon className={clsx(cssClass(ELEMENT_ICON), cssClass(slidePrefix(SLIDE_STATUS_ERROR)))} />
            ))}
        </div>
      )}
    </>
  );
}
