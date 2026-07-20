import { refKey } from "./utils.js";

/**
 * @internal
 */
export const isSafari = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("safari") > -1 && ua.indexOf("chrome") <= -1;
};

const TEXT_STYLE_KEYS: (keyof React.CSSProperties)[] = [
  "direction",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "border",
  "borderWidth",
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderStyle",
  "borderTopStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderRightStyle",
  "fontSize",
  "fontFamily",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSizeAdjust",
  "textAlign",
  "textTransform",
  "textIndent",
  "letterSpacing",
  "wordSpacing",
  "lineHeight",
  "whiteSpace",
  "wordBreak",
  "overflowWrap",
  "tabSize",
  "MozTabSize",
];

const getPropertyValue = (style: CSSStyleDeclaration, key: string): string => {
  return style.getPropertyValue(key);
};
const setProperty = (
  style: CSSStyleDeclaration,
  key: string,
  value: string
) => {
  style.setProperty(key, value);
};

const getValueFromStyle = (style: CSSStyleDeclaration, key: string): number => {
  const value = getPropertyValue(style, key);
  if (!value) {
    return 0;
  } else {
    return parseInt(value, 10);
  }
};

/**
 * @internal
 */
export const getStyle = (e: Element) => getComputedStyle(e);

/**
 * @internal
 */
export const hasPercentageUnit = (
  widthOrHeight: React.CSSProperties["width"] | React.CSSProperties["height"]
): boolean => {
  return typeof widthOrHeight === "string" && widthOrHeight.endsWith("%");
};

/**
 * @internal
 */
export const getVerticalPadding = (style: CSSStyleDeclaration): number => {
  return (
    getValueFromStyle(style, "padding-top") +
    getValueFromStyle(style, "padding-bottom") +
    getValueFromStyle(style, "border-top") +
    getValueFromStyle(style, "border-bottom")
  );
};

/**
 * @internal
 */
export const getHorizontalPadding = (style: CSSStyleDeclaration): number => {
  return (
    getValueFromStyle(style, "padding-left") +
    getValueFromStyle(style, "padding-right") +
    getValueFromStyle(style, "border-left") +
    getValueFromStyle(style, "border-right")
  );
};

/**
 * @internal
 */
export const getPointedElement = (
  textarea: HTMLElement,
  backdrop: HTMLElement,
  e: MouseEvent
): HTMLElement | null => {
  const POINTER_EVENTS = "pointer-events";

  const textareaStyle = textarea.style;
  const backdropStyle = backdrop.style;
  const prev = getPropertyValue(textareaStyle, POINTER_EVENTS);
  const backPrev = getPropertyValue(backdropStyle, POINTER_EVENTS);
  setProperty(textareaStyle, POINTER_EVENTS, "none");
  setProperty(backdropStyle, POINTER_EVENTS, "auto");

  const pointed = document.elementFromPoint(
    e.clientX,
    e.clientY
  ) as HTMLElement | null;

  setProperty(textareaStyle, POINTER_EVENTS, prev);
  setProperty(backdropStyle, POINTER_EVENTS, backPrev);

  if (isInsideBackdrop(pointed, backdrop)) {
    return pointed;
  } else {
    return null;
  }
};

const isInsideBackdrop = (
  pointed: HTMLElement | null,
  backdrop: HTMLElement
): boolean => !!pointed && backdrop !== pointed && backdrop.contains(pointed);

const dispatchMouseEvent = (
  target: HTMLElement,
  type: string,
  init: MouseEventInit
) => {
  target.dispatchEvent(new MouseEvent(type, init));
};

/**
 * @internal
 */
export const dispatchClonedMouseEvent = (
  pointed: HTMLElement,
  e: MouseEvent
) => {
  dispatchMouseEvent(pointed, e.type, e);
};

/**
 * @internal
 */
export const dispatchMouseMoveEvent = (
  pointed: HTMLElement | null,
  prevPointed: HTMLElement | null,
  e: MouseEvent
) => {
  if (pointed) {
    dispatchClonedMouseEvent(pointed, e);
  }

  if (prevPointed !== pointed) {
    dispatchMouseOutEvent(prevPointed, e);
    if (pointed) {
      dispatchMouseEvent(pointed, "mouseover", e);
    }
  }
};

/**
 * @internal
 */
export const dispatchMouseOutEvent = (
  prevPointed: HTMLElement | null,
  e: MouseEvent
) => {
  if (prevPointed) {
    dispatchMouseEvent(prevPointed, "mouseout", e);
  }
};

/**
 * @internal
 */
export const stopPropagation = (event: React.MouseEvent) => {
  event.stopPropagation();
};

/**
 * @internal
 */
export const syncBackdropStyle = (
  textarea: HTMLElement,
  backdrop: HTMLElement,
  caretColorRef: React.MutableRefObject<string>,
  style?: React.CSSProperties
) => {
  const computedTextAreaStyle = getStyle(textarea);
  const textareaStyle = textarea.style;
  const backdropStyle = backdrop.style;
  if (!caretColorRef[refKey]) {
    caretColorRef[refKey] = getPropertyValue(computedTextAreaStyle, "color");
  }

  TEXT_STYLE_KEYS.forEach((k) => {
    backdropStyle[k as any] = computedTextAreaStyle[k as any]!;
  });
  textareaStyle.color = backdropStyle.borderColor = "transparent";
  textareaStyle.caretColor = style?.caretColor || caretColorRef[refKey];
};

/**
 * @internal
 */
export const listenEvent = <
  E extends HTMLElement | Document,
  K extends keyof GlobalEventHandlersEventMap,
>(
  el: E,
  key: K,
  cb: (this: E, ev: GlobalEventHandlersEventMap[K]) => void
) => {
  el.addEventListener(key, cb as EventListenerOrEventListenerObject);
  return () => {
    el.removeEventListener(key, cb as EventListenerOrEventListenerObject);
  };
};
