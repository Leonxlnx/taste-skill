import type React from "react";

/** Layout type */
export type LayoutType = "rows" | "columns" | "masonry";

/** Photo object */
export interface Photo extends Image {
  /** React `key` attribute. */
  key?: string;
  /** Image `alt` attribute. */
  alt?: string;
  /** Image `title` attribute. */
  title?: string;
  /** Image link URL. */
  href?: string;
  /** ARIA label for the link and button elements */
  label?: string;
  /** Optional array of alternative images to be included in the `srcset` attribute. */
  srcSet?: readonly Image[];
}

/** Image object */
export interface Image {
  /** Image source. */
  src: string;
  /** Image width in pixels. */
  width: number;
  /** Image height in pixels. */
  height: number;
}

/** Common photo album props */
export interface CommonPhotoAlbumProps<TPhoto extends Photo = Photo> {
  /** An array of photos to display in the photo album. */
  photos: readonly TPhoto[];
  /** Spacing between images. */
  spacing?: ResponsiveParameter;
  /** Padding around each image. */
  padding?: ResponsiveParameter;
  /** Photo album container width in various viewports. */
  sizes?: ResponsiveSizes;
  /** Photo album layout breakpoints. */
  breakpoints?: readonly number[];
  /** Default container width in SSR. */
  defaultContainerWidth?: number;
  /** Photo click callback. */
  onClick?: ClickHandler<TPhoto>;
  /** Custom render functions. */
  render?: ResponsiveParameter<Render<TPhoto>, number | undefined>;
  /** Additional HTML attributes to be passed to the rendered elements. */
  componentsProps?: ResponsiveParameter<ComponentsProps<TPhoto>, number | undefined>;
  /** Fallback skeleton in SSR. */
  skeleton?: React.ReactNode;
}

/** Rows photo album props */
export interface RowsPhotoAlbumProps<TPhoto extends Photo = Photo> extends CommonPhotoAlbumProps<TPhoto> {
  /** Target row height. */
  targetRowHeight?: ResponsiveParameter;
  /** Additional row constraints. */
  rowConstraints?: ResponsiveParameter<RowConstraints>;
}

/** Columns photo album props */
export interface ColumnsPhotoAlbumProps<TPhoto extends Photo = Photo> extends CommonPhotoAlbumProps<TPhoto> {
  /** Number of columns. */
  columns?: ResponsiveParameter;
}

/** Masonry photo album props */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MasonryPhotoAlbumProps<TPhoto extends Photo = Photo> extends ColumnsPhotoAlbumProps<TPhoto> {}

/** Photo album sizes settings */
export type ResponsiveSizes = {
  /** Default size, e.g. `100vw` or `calc(100vw - 200px)`. */
  size: string;
  /** Array of sizes at various breakpoints. */
  sizes?: readonly {
    /** Viewport size media query, e.g. `(max-width: 600px)`.  */
    viewport: string;
    /** Photo album width at a given viewport size, e.g. `calc(100vw - 50px)`. */
    size: string;
  }[];
};

/** Row constraints */
export type RowConstraints = {
  /** Minimum number of photos per row. */
  minPhotos?: number;
  /** Maximum number of photos per row. */
  maxPhotos?: number;
  /** Maximum row height when there is not enough photos to fill more than one row. */
  singleRowMaxHeight?: number;
};

/** Layout model */
export type LayoutModel<TPhoto extends Photo = Photo> = {
  /** Spacing value. */
  spacing: number;
  /** Padding value. */
  padding: number;
  /** Container width. */
  containerWidth: number;
  /** Layout variables. */
  variables?: LayoutVariables;
  /** Layout orientation. */
  horizontal?: boolean;
  /** Layout tracks. */
  tracks: readonly {
    /** Track variables. */
    variables?: LayoutVariables;
    /** Photos array. */
    photos: readonly {
      /** Photo object. */
      photo: TPhoto;
      /** Photo index in the original `photos` array. */
      index: number;
      /** Rendered photo width in pixels. */
      width: number;
      /** Rendered photo height in pixels. */
      height: number;
    }[];
  }[];
};

/** Layout variables */
export type LayoutVariables = Record<string, string | number | undefined>;

/** Responsive parameter */
export type ResponsiveParameter<Value = number, ContainerWidth = number> =
  | ((containerWidth: ContainerWidth) => Value)
  | Value;

/** Components props */
export type ComponentsProps<TPhoto extends Photo = Photo> = {
  /** Additional HTML attributes for the outer `<div>` container. */
  container?: ContainerComponentProps;
  /** Additional HTML attributes for the row / column `<div>` container. */
  track?: TrackComponentProps;
  /** Additional HTML attributes for the image `<div>` wrapper. */
  wrapper?: WrapperComponentProps<TPhoto>;
  /** Additional HTML attributes for the photo `<a>` link. */
  link?: LinkComponentProps<TPhoto>;
  /** Additional HTML attributes for the photo `<button>` element. */
  button?: ButtonComponentProps<TPhoto>;
  /** Additional HTML attributes for the photo `<img>` element. */
  image?: ImageComponentProps<TPhoto>;
};

/** Container component props */
export type ContainerComponentProps = React.ComponentPropsWithoutRef<"div">;

/** Track component props */
export type TrackComponentProps = React.ComponentPropsWithoutRef<"div">;

/** Wrapper component props */
export type WrapperComponentProps<TPhoto extends Photo = Photo> = ContextAware<
  React.ComponentPropsWithoutRef<"div">,
  RenderWrapperContext<TPhoto>
>;

/** Link component props */
export type LinkComponentProps<TPhoto extends Photo = Photo> = ContextAware<
  React.ComponentPropsWithoutRef<"a">,
  RenderLinkContext<TPhoto>
>;

/** Button component props */
export type ButtonComponentProps<TPhoto extends Photo = Photo> = ContextAware<
  React.ComponentPropsWithoutRef<"button">,
  RenderButtonContext<TPhoto>
>;

/** Image component props */
export type ImageComponentProps<TPhoto extends Photo = Photo> = ContextAware<
  React.ComponentPropsWithoutRef<"img">,
  RenderImageContext<TPhoto>
>;

/** Click handler */
export type ClickHandler<TPhoto extends Photo = Photo> = (props: ClickHandlerProps<TPhoto>) => void;

/** Click callback props */
export type ClickHandlerProps<TPhoto extends Photo = Photo> = {
  /** Click event. */
  event: React.MouseEvent;
  /** Photo object. */
  photo: TPhoto;
  /** Photo index in the original `photos` array. */
  index: number;
};

/** Custom render functions */
export type Render<TPhoto extends Photo = Photo> = {
  /** Custom container render function. */
  container?: RenderContainer;
  /** Custom track render function. */
  track?: RenderTrack;
  /** Custom wrapper render function. */
  wrapper?: RenderWrapper<TPhoto>;
  /** Custom link render function. */
  link?: RenderLink<TPhoto>;
  /** Custom button render function. */
  button?: RenderButton<TPhoto>;
  /** Custom image render function. */
  image?: RenderImage<TPhoto>;
  /** Custom photo render function. */
  photo?: RenderPhoto<TPhoto>;
  /** Custom extra markup render function. */
  extras?: RenderExtras<TPhoto>;
};

/** Render container */
export type RenderContainer = RenderFunction<RenderContainerProps>;

/** Render container props */
export type RenderContainerProps = React.ComponentPropsWithRef<"div">;

/** Render track */
export type RenderTrack = RenderFunction<RenderTrackProps>;

/** Render track props */
export type RenderTrackProps = React.ComponentPropsWithoutRef<"div">;

/** Render wrapper */
export type RenderWrapper<TPhoto extends Photo = Photo> = RenderFunction<
  RenderWrapperProps,
  RenderWrapperContext<TPhoto>
>;

/** Render wrapper props */
export type RenderWrapperProps = React.ComponentPropsWithoutRef<"div">;

/** Render wrapper context */
export type RenderWrapperContext<TPhoto extends Photo = Photo> = RenderPhotoContext<TPhoto>;

/** Render link */
export type RenderLink<TPhoto extends Photo = Photo> = RenderFunction<RenderLinkProps, RenderLinkContext<TPhoto>>;

/** Render link props */
export type RenderLinkProps = NonOptional<React.ComponentPropsWithoutRef<"a">, "href">;

/** Render link context */
export type RenderLinkContext<TPhoto extends Photo = Photo> = RenderPhotoContext<TPhoto>;

/** Render button */
export type RenderButton<TPhoto extends Photo = Photo> = RenderFunction<RenderButtonProps, RenderButtonContext<TPhoto>>;

/** Render button props */
export type RenderButtonProps = React.ComponentPropsWithoutRef<"button">;

/** Render button context */
export type RenderButtonContext<TPhoto extends Photo = Photo> = RenderPhotoContext<TPhoto>;

/** Render image */
export type RenderImage<TPhoto extends Photo = Photo> = RenderFunction<RenderImageProps, RenderImageContext<TPhoto>>;

/** Render image props */
export type RenderImageProps = NonOptional<React.ComponentPropsWithoutRef<"img">, "src">;

/** Render image context */
export type RenderImageContext<TPhoto extends Photo = Photo> = RenderPhotoContext<TPhoto>;

/** Render photo */
export type RenderPhoto<TPhoto extends Photo = Photo> = RenderFunction<RenderPhotoProps, RenderPhotoContext<TPhoto>>;

/** Render photo props */
export type RenderPhotoProps = {
  /** Click callback. */
  onClick?: React.MouseEventHandler;
};

/** Render photo context */
export type RenderPhotoContext<TPhoto extends Photo = Photo> = {
  /** Photo object. */
  photo: TPhoto;
  /** Photo index in the original `photos` array. */
  index: number;
  /** Rendered photo width in pixels. */
  width: number;
  /** Rendered photo height in pixels. */
  height: number;
};

/** Render extras */
export type RenderExtras<TPhoto extends Photo = Photo> = RenderFunction<object, RenderPhotoContext<TPhoto>>;

/** Render function */
export type RenderFunction<Props extends object | void = void, Context extends object | void = void> = [
  Context,
] extends [void]
  ? [Props] extends [void]
    ? () => React.ReactNode
    : (
        /** Component props. */
        props: Props,
      ) => React.ReactNode
  : [Props] extends [void]
    ? never
    : (
        /** Component props. */
        props: Props,
        /** Rendering context. */
        context: Context,
      ) => React.ReactNode;

export type ResolvedNumber<TWidth extends number | undefined = number | undefined> = TWidth extends number
  ? number
  : number | undefined;

export type NonOptional<Props, Keys extends keyof Props> = Required<Pick<Props, Keys>> & Omit<Props, Keys>;

export type ContextAware<Props, Context> = Props | ((context: Context) => Props | undefined);

export type JSXElement = React.JSX.Element;

export type ForwardedRef<T extends HTMLElement = HTMLElement> = React.ForwardedRef<T>;

export type ElementRef<T extends HTMLElement = HTMLElement> = {
  ref?: React.Ref<T>;
};
