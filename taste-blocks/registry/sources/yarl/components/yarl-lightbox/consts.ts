export const MODULE_CAROUSEL = "carousel";
export const MODULE_CONTROLLER = "controller";
export const MODULE_NAVIGATION = "navigation";
export const MODULE_NO_SCROLL = "no-scroll";
export const MODULE_PORTAL = "portal";
export const MODULE_ROOT = "root";
export const MODULE_TOOLBAR = "toolbar";

export const PLUGIN_CAPTIONS = "captions";
export const PLUGIN_COUNTER = "counter";
export const PLUGIN_DOWNLOAD = "download";
export const PLUGIN_FULLSCREEN = "fullscreen";
export const PLUGIN_INLINE = "inline";
export const PLUGIN_SHARE = "share";
export const PLUGIN_SLIDESHOW = "slideshow";
export const PLUGIN_THUMBNAILS = "thumbnails";
export const PLUGIN_ZOOM = "zoom";

export const SLIDE_STATUS_LOADING = "loading";
export const SLIDE_STATUS_PLAYING = "playing";
export const SLIDE_STATUS_ERROR = "error";
export const SLIDE_STATUS_COMPLETE = "complete";
export const SLIDE_STATUS_PLACEHOLDER = "placeholder";

export type SlideStatus =
  | typeof SLIDE_STATUS_LOADING
  | typeof SLIDE_STATUS_PLAYING
  | typeof SLIDE_STATUS_ERROR
  | typeof SLIDE_STATUS_COMPLETE;

export const activeSlideStatus = (status: SlideStatus): `active-slide-${SlideStatus}` => `active-slide-${status}`;

export const ACTIVE_SLIDE_LOADING = activeSlideStatus(SLIDE_STATUS_LOADING) as "active-slide-loading";
export const ACTIVE_SLIDE_PLAYING = activeSlideStatus(SLIDE_STATUS_PLAYING) as "active-slide-playing";
export const ACTIVE_SLIDE_ERROR = activeSlideStatus(SLIDE_STATUS_ERROR) as "active-slide-error";
export const ACTIVE_SLIDE_COMPLETE = activeSlideStatus(SLIDE_STATUS_COMPLETE) as "active-slide-complete";

export const CLASS_FULLSIZE = "fullsize";
export const CLASS_FLEX_CENTER = "flex_center";
export const CLASS_NO_SCROLL = "no_scroll";
export const CLASS_NO_SCROLL_PADDING = "no_scroll_padding";
export const CLASS_SLIDE = "slide";
export const CLASS_SLIDE_WRAPPER = "slide_wrapper";
export const CLASS_SLIDE_WRAPPER_INTERACTIVE = "slide_wrapper_interactive";

export const ACTION_PREV = "prev";
export const ACTION_NEXT = "next";
export const ACTION_SWIPE = "swipe";
export const ACTION_CLOSE = "close";

export const EVENT_ON_POINTER_DOWN = "onPointerDown";
export const EVENT_ON_POINTER_MOVE = "onPointerMove";
export const EVENT_ON_POINTER_UP = "onPointerUp";
export const EVENT_ON_POINTER_LEAVE = "onPointerLeave";
export const EVENT_ON_POINTER_CANCEL = "onPointerCancel";
export const EVENT_ON_KEY_DOWN = "onKeyDown";
export const EVENT_ON_KEY_UP = "onKeyUp";
export const EVENT_ON_WHEEL = "onWheel";

export const VK_ESCAPE = "Escape";
export const VK_ARROW_LEFT = "ArrowLeft";
export const VK_ARROW_RIGHT = "ArrowRight";

export const ELEMENT_BUTTON = "button";
export const ELEMENT_ICON = "icon";

export const IMAGE_FIT_CONTAIN = "contain";
export const IMAGE_FIT_COVER = "cover";

export const UNKNOWN_ACTION_TYPE = "Unknown action type";
