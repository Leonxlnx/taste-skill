import * as React from "react";

import {
  ACTION_CLOSE,
  ACTION_NEXT,
  ACTION_PREV,
  ACTION_SWIPE,
  ACTIVE_SLIDE_COMPLETE,
  ACTIVE_SLIDE_ERROR,
  ACTIVE_SLIDE_LOADING,
  ACTIVE_SLIDE_PLAYING,
} from "./consts.js";

/** Lightbox external props */
export type LightboxExternalProps = DeepPartial<
  DeepPartial<DeepPartial<LightboxProps, "animation" | "toolbar" | "noScroll">, "carousel", "imageProps">,
  "controller",
  "ref"
>;

/** Lightbox properties */
export interface LightboxProps {
  // TODO v4: consider https://github.com/igordanchenko/yet-another-react-lightbox/issues/374
  /** if `true`, the lightbox is open */
  open: boolean;
  /** a callback to close the lightbox */
  close: Callback;
  /** starting slide index */
  index: number;
  /** slides to display in the lightbox */
  slides: readonly Slide[];
  /** custom render functions */
  render: Render;
  /** custom UI labels / translations */
  labels: Labels;
  /** enabled plugins */
  plugins: readonly Plugin[];
  /** toolbar settings */
  toolbar: ToolbarSettings;
  /** carousel settings */
  carousel: CarouselSettings;
  /** animation settings */
  animation: AnimationSettings;
  /** controller settings */
  controller: ControllerSettings;
  /** portal settings */
  portal: PortalSettings;
  /** NoScroll module settings */
  noScroll: NoScrollSettings;
  /** lifecycle callbacks */
  on: Callbacks;
  /** customization styles */
  styles: SlotStyles;
  /** CSS class of the lightbox root element */
  className: string;
}

/** Slide */
export type Slide = SlideTypes[SlideTypeKey];

/** Supported slide types */
export interface SlideTypes {
  /** image slide type */
  image: SlideImage;
}

/** Slide type key */
export type SlideTypeKey = keyof SlideTypes;

/** Generic slide */
export interface GenericSlide {
  type?: SlideTypeKey;
}

/** Image slide properties */
export interface SlideImage extends GenericSlide {
  /** image slide type */
  type?: "image";
  /** image URL */
  src: string;
  /** image 'alt' attribute */
  alt?: string;
  /** image width in pixels */
  width?: number;
  /** image height in pixels */
  height?: number;
  /** `object-fit` setting */
  imageFit?: ImageFit;
  /** alternative images to be passed to the 'srcSet' */
  srcSet?: readonly ImageSource[];
}

/** Image source */
export interface ImageSource {
  /** image URL */
  src: string;
  /** image width in pixels */
  width: number;
  /** image height in pixels */
  height: number;
}

/** Image fit setting */
export type ImageFit = "contain" | "cover";

/** Lightbox component */
export type Component = React.ComponentType<ComponentProps>;

/** Lightbox component properties */
export type ComponentProps = React.PropsWithChildren<Omit<LightboxProps, "slides" | "index" | "plugins">>;

/** Lightbox component tree node */
export type Node = {
  /** module */
  module: Module;
  /** module child nodes */
  children?: Node[];
};

/** Lightbox module */
export type Module = {
  /** module name */
  name: string;
  /** module component */
  component: Component;
};

/** Lightbox props augmentation */
export type Augmentation = (props: ComponentProps) => ComponentProps;

/** Container rect */
export type ContainerRect = {
  width: number;
  height: number;
};

/** Customization slots */
export type Slot = SlotType[keyof SlotType];

/** Supported customization slots */
export interface SlotType {
  /** lightbox root customization slot */
  root: "root";
  /** lightbox container customization slot */
  container: "container";
  /** lightbox slide customization slot */
  slide: "slide";
  /** lightbox button customization slot */
  button: "button";
  /** lightbox icon customization slot */
  icon: "icon";
  /** lightbox toolbar customization slot */
  toolbar: "toolbar";
  /** lightbox Prev navigation button customization slot */
  navigationPrev: "navigationPrev";
  /** lightbox Next navigation button customization slot */
  navigationNext: "navigationNext";
}

/** Customization slot CSS properties */
interface SlotCSSProperties extends React.CSSProperties {
  [key: `--yarl__${string}`]: string | number;
}

/** Customization slots styles */
export type SlotStyles = {
  [key in Slot]?: SlotCSSProperties;
};

/** Carousel settings */
export interface CarouselSettings {
  /** if `true`, the lightbox carousel doesn't wrap around */
  finite: boolean;
  /** the lightbox preloads (2 * preload + 1) slides */
  preload: number;
  /** padding around each slide (e.g., "16px", "10%" or 0) */
  padding: LengthOrPercentage;
  /** spacing between slides (e.g., "100px", "50%" or 0) */
  spacing: LengthOrPercentage;
  /** `object-fit` setting for image slides */
  imageFit: ImageFit;
  /** custom image attributes */
  imageProps: ImageProps | ((slide: Slide) => ImageProps);
}

export type LengthOrPercentage = `${number}px` | `${number}%` | number;

export type ImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "sizes" | "srcSet" | "onLoad" | "onError" | "onClick"
>;

/** Animation settings */
export interface AnimationSettings {
  /** fade-in / fade-out animation settings */
  fade: number;
  /** swipe animation settings */
  swipe: number;
  /** override for `swipe` animation settings when using keyboard navigation or navigation buttons */
  navigation?: number;
  /** animation timing function settings */
  easing: {
    /** fade-in / fade-out animation timing function */
    fade: string;
    /** slide swipe animation timing function */
    swipe: string;
    /** slide navigation animation timing function (when using keyboard navigation or navigation buttons) */
    navigation: string;
  };
}

/** Controller settings */
export interface ControllerSettings {
  /** controller ref */
  ref: React.ForwardedRef<ControllerRef>;
  // TODO v4: remove
  /** @deprecated for internal use only */
  focus: boolean;
  // TODO v4: remove
  /** @deprecated for internal use only */
  touchAction: "none" | "pan-y";
  // TODO v4: remove
  /** @deprecated for internal use only */
  aria: boolean;
  /** if `true`, close the lightbox on pull-up gesture */
  closeOnPullUp: boolean;
  /** if `true`, close the lightbox on pull-down gesture */
  closeOnPullDown: boolean;
  /** if `true`, close the lightbox when the backdrop is clicked */
  closeOnBackdropClick: boolean;
  /** if `true`, close the lightbox on Escape key press (default: `true`) */
  closeOnEscape: boolean;
  /** if `true`, prevent default for horizontal wheel scroll events (for internal use only) */
  preventDefaultWheelX: boolean;
  /** if `true`, prevent default for vertical wheel scroll events (for internal use only) */
  preventDefaultWheelY: boolean;
  /** if `true`, disable slide change on pointer swipe / drag */
  disableSwipeNavigation: boolean;
}

/** Lightbox controller ref */
export interface ControllerRef {
  /** navigate to the previous slide */
  prev: Callback<NavigationAction | void>;
  /** navigate to the next slide */
  next: Callback<NavigationAction | void>;
  /** close the lightbox */
  close: Callback;
  /** transfer focus to the lightbox controller */
  focus: Callback;
  /** get lightbox props */
  getLightboxProps: () => ComponentProps;
  /** get lightbox state */
  getLightboxState: () => LightboxState;
}

/** Portal settings */
export interface PortalSettings {
  /** portal mount point */
  root?: (() => DocumentFragment | Element | null) | DocumentFragment | Element | null;
  /** HTML attributes for the portal container */
  container?: React.HTMLAttributes<HTMLDivElement>;
}

/** NoScroll module settings */
export interface NoScrollSettings {
  /** if `true`, the NoScroll module functionality is disabled */
  disabled: boolean;
}

/** Lightbox navigation action */
export interface NavigationAction {
  /** navigate through the specified number of slides */
  count?: number;
}

/** Lightbox state swipe action */
export type LightboxStateSwipeAction = {
  type: "swipe";
  increment: number;
  duration?: number;
  easing?: string;
};

/** Lightbox state update action */
export type LightboxStateUpdateAction = {
  type: "update";
  slides: readonly Slide[];
  index: number;
};

/** Lightbox state */
export interface LightboxState {
  /** lightbox slides */
  slides: readonly Slide[];
  /** current slide index */
  currentIndex: number;
  /** current slide index in the (-∞, +∞) range */
  globalIndex: number;
  /** current slide */
  currentSlide: Slide | undefined;
  /** current animation */
  animation?: { increment?: number; duration?: number; easing?: string };
}

/** Render function */
export type RenderFunction<T = void> = [T] extends [void] ? () => React.ReactNode : (props: T) => React.ReactNode;

/** `render.slide` render function props */
export interface RenderSlideProps<S extends Slide = Slide> {
  /** slide */
  slide: S;
  /** slide offset (`0` - current slide, `1` - next slide, `-1` - previous slide, etc.) */
  offset: number;
  /** container rect */
  rect: ContainerRect;
}

/** `render.slideHeader` render function props */
export interface RenderSlideHeaderProps {
  slide: Slide;
}

/** `render.slideFooter` render function props */
export interface RenderSlideFooterProps {
  slide: Slide;
}

/** `render.slideContainer` render function props */
export interface RenderSlideContainerProps extends React.PropsWithChildren {
  slide: Slide;
}

/** Custom render functions. */
export interface Render {
  /** render custom slide type, or override the default image slide */
  slide?: RenderFunction<RenderSlideProps>;
  /** render custom slide header (use absolute positioning) */
  slideHeader?: RenderFunction<RenderSlideHeaderProps>;
  /** render custom slide footer (use absolute positioning) */
  slideFooter?: RenderFunction<RenderSlideFooterProps>;
  /** render custom slide container */
  slideContainer?: RenderFunction<RenderSlideContainerProps>;
  /** render custom controls or additional elements in the lightbox (use absolute positioning) */
  controls?: RenderFunction;
  /** render custom Prev icon */
  iconPrev?: RenderFunction;
  /** render custom Next icon */
  iconNext?: RenderFunction;
  /** render custom Close icon */
  iconClose?: RenderFunction;
  /** render custom Loading icon */
  iconLoading?: RenderFunction;
  /** render custom Error icon */
  iconError?: RenderFunction;
  /** render custom Prev button */
  buttonPrev?: RenderFunction;
  /** render custom Next button */
  buttonNext?: RenderFunction;
  /** render custom Close button */
  buttonClose?: RenderFunction;
}

export type Callback<T = void> = [T] extends [void] ? () => void : (props: T) => void;

export interface ViewCallbackProps {
  index: number;
}

export interface ClickCallbackProps {
  index: number;
}

/** Lifecycle callbacks */
export interface Callbacks {
  /** a callback called when a slide becomes active */
  view?: Callback<ViewCallbackProps>;
  /** a callback called when a slide is clicked */
  click?: Callback<ClickCallbackProps>;
  /** a callback called when the portal starts opening */
  entering?: Callback;
  /** a callback called when the portal opens */
  entered?: Callback;
  /** a callback called when the portal starts closing */
  exiting?: Callback;
  /** a callback called when the portal closes */
  exited?: Callback;
}

/** Custom UI labels / translations / localization */
export interface Labels {
  /** `Previous` button title */
  Previous?: string;
  /** `Next` button title */
  Next?: string;
  /** `Close` button title */
  Close?: string;
  /** Slide ARIA role description */
  Slide?: string;
  /** Carousel ARIA role description */
  Carousel?: string;
  /** Lightbox ARIA label */
  Lightbox?: string;
  /** Carousel ARIA label */
  "Photo gallery"?: string;
  /**
   * Slide ARIA label
   *
   * The value is a template string supporting the following placeholders:
   * - {index} - current slide index
   * - {total} - total number of slides
   */
  "{index} of {total}"?: string;
}

export type Label = keyof Labels;

/** Toolbar settings */
export interface ToolbarSettings {
  /** buttons to render in the toolbar */
  buttons: readonly (ToolbarButtonKey | React.ReactNode)[];
}

export type ToolbarButtonKey = keyof ToolbarButtonKeys;

export interface ToolbarButtonKeys {
  close: null;
}

export interface EventTypes {
  [ACTION_PREV]: NavigationAction | void;
  [ACTION_NEXT]: NavigationAction | void;
  [ACTION_SWIPE]: LightboxStateSwipeAction;
  [ACTION_CLOSE]: void;

  [ACTIVE_SLIDE_LOADING]: void;
  [ACTIVE_SLIDE_PLAYING]: void;
  [ACTIVE_SLIDE_COMPLETE]: void;
  [ACTIVE_SLIDE_ERROR]: void;
}

/** Plugin methods */
export interface PluginProps {
  /** test if a target module is present */
  contains: (target: string) => boolean;
  /** add module as a parent */
  addParent: (target: string, module: Module) => void;
  /** add module as a child */
  addChild: (target: string, module: Module, precede?: boolean) => void;
  /** add module as a sibling */
  addSibling: (target: string, module: Module, precede?: boolean) => void;
  /** append module to the Controller module */
  addModule: (module: Module) => void;
  /** replace module */
  replace: (target: string, module: Module) => void;
  /** add module as a child and inherit all existing children */
  append: (target: string, module: Module) => void;
  /** remove module */
  remove: (target: string) => void;
  /** augment lightbox props */
  augment: (augmentation: Augmentation) => void;
}

/** Lightbox plugin */
export type Plugin = (props: PluginProps) => void;

/** Deep partial utility type */
export type DeepPartial<T extends object, K extends keyof T = keyof T, E extends string = never> = Omit<
  Partial<T>,
  K
> & {
  [P in K]?: DeepPartialValue<T[P], E>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeepPartialValue<T, E extends string = never> = T extends readonly any[]
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...props: any[]) => any
    ? T
    : T extends object
      ? {
          [P in keyof T]?: P extends E ? T[P] : DeepPartialValue<T[P], E>;
        }
      : T;
