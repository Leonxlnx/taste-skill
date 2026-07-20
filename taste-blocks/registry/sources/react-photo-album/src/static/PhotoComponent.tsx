import type React from "react";
import { forwardRef } from "react";

import Component from "./Component";
import { round } from "../utils";
import type {
  ComponentsProps,
  ElementRef,
  ForwardedRef,
  JSXElement,
  Photo,
  Render,
  RenderPhotoContext,
  RenderPhotoProps,
} from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Unwrap<T> = T extends (args: any) => unknown ? never : T;

type Unwrapped<T> = {
  [P in keyof T]: Unwrap<T[P]>;
};

type PhotoComponentProps<TPhoto extends Photo> = RenderPhotoProps &
  RenderPhotoContext<TPhoto> & {
    render?: Pick<Render<TPhoto>, "wrapper" | "link" | "button" | "image" | "extras">;
    componentsProps?: Unwrapped<Pick<ComponentsProps<TPhoto>, "wrapper" | "link" | "button" | "image">>;
  };

function PhotoComponent<TPhoto extends Photo>(
  {
    photo,
    index,
    width,
    height,
    onClick,
    render: { wrapper, link, button, image, extras } = {},
    componentsProps: { link: linkProps, button: buttonProps, wrapper: wrapperProps, image: imageProps } = {},
  }: PhotoComponentProps<TPhoto>,
  ref: ForwardedRef,
) {
  const { href } = photo;

  const context = { photo, index, width: round(width, 3), height: round(height, 3) };

  let props: Omit<React.ComponentPropsWithoutRef<typeof Component>, "variables">;
  if (href) {
    props = { ...linkProps, as: "a", render: link, classes: ["photo", "link"], href, onClick };
  } else if (onClick) {
    props = { ...buttonProps, as: "button", type: "button", render: button, classes: ["photo", "button"], onClick };
  } else {
    props = { ...wrapperProps, render: wrapper, classes: "photo" };
  }

  return (
    <Component
      ref={ref}
      variables={{ photoWidth: context.width, photoHeight: context.height }}
      {...{ context, ...props }}
    >
      <Component as="img" classes="image" render={image} context={context} {...imageProps} />
      {extras?.({}, context)}
    </Component>
  );
}

export default forwardRef(PhotoComponent) as <TPhoto extends Photo>(
  props: PhotoComponentProps<TPhoto> & ElementRef,
) => JSXElement;
