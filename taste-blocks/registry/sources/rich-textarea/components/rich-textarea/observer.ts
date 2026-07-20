import {
  dispatchClonedMouseEvent,
  dispatchMouseMoveEvent,
  dispatchMouseOutEvent,
  getHorizontalPadding,
  getPointedElement,
  getStyle,
  getVerticalPadding,
  listenEvent,
} from "./dom.js";
import { type SelectionStore } from "./selection.js";

/**
 * @internal
 */
export type TextareaRect = [
  width: number,
  height: number,
  hPadding: number,
  vPadding: number,
];

/**
 * @internal
 */
export const createTextareaObserver = (
  textarea: HTMLTextAreaElement | HTMLInputElement,
  backdrop: HTMLDivElement,
  selectionStore: SelectionStore,
  onResize: (size: TextareaRect) => void,
  onFocus: (value: boolean) => void
) => {
  let prevPointed: HTMLElement | null = null;

  const observer = new ResizeObserver(([entry]) => {
    const {
      contentRect: { width, height },
      borderBoxSize,
    } = entry!;
    if (borderBoxSize && borderBoxSize[0]) {
      onResize([
        width,
        height,
        borderBoxSize[0].inlineSize - width,
        borderBoxSize[0].blockSize - height,
      ]);
      return;
    }
    const style = getStyle(textarea);
    onResize([
      width,
      height,
      getHorizontalPadding(style),
      getVerticalPadding(style),
    ]);
  });

  const cleanUpOnFocus = listenEvent(textarea, "focus", () => {
    onFocus(true);
  });
  const cleanUpOnBlur = listenEvent(textarea, "blur", () => {
    onFocus(false);
  });
  const cleanUpOnScroll = listenEvent(textarea, "scroll", () => {
    const { scrollTop, scrollLeft } = textarea;
    backdrop.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
  });
  const cleanUpOnMouseDown = listenEvent(textarea, "mousedown", (e) => {
    selectionStore._updateSeletion();
    const cleanup = listenEvent(document, "mouseup", () => {
      selectionStore._updateSeletion();
      cleanup();
    });
    const pointed = getPointedElement(textarea, backdrop, e);
    if (pointed) {
      dispatchClonedMouseEvent(pointed, e);
    }
  });
  const cleanUpOnMouseUp = listenEvent(textarea, "mouseup", (e) => {
    const pointed = getPointedElement(textarea, backdrop, e);
    if (pointed) {
      dispatchClonedMouseEvent(pointed, e);
    }
  });
  const cleanUpOnMouseMove = listenEvent(textarea, "mousemove", (e) => {
    const p = getPointedElement(textarea, backdrop, e);
    dispatchMouseMoveEvent(p, prevPointed, e);
    prevPointed = p;
  });
  const cleanUpOnMouseLeave = listenEvent(textarea, "mouseleave", (e) => {
    dispatchMouseOutEvent(prevPointed, e);
    prevPointed = null;
  });
  const cleanUpOnClick = listenEvent(textarea, "click", (e) => {
    const pointed = getPointedElement(textarea, backdrop, e);
    if (pointed) {
      dispatchClonedMouseEvent(pointed, e);
    }
  });
  const cleanUpOnInput = listenEvent(textarea, "input", () => {
    selectionStore._updateSeletion();
  });
  const cleanUpOnCompositionStart = listenEvent(
    textarea,
    "compositionstart",
    (e) => {
      selectionStore._setComposition(e);
    }
  );
  const cleanUpOnCompositionUpdate = listenEvent(
    textarea,
    "compositionupdate",
    (e) => {
      selectionStore._setComposition(e);
    }
  );
  const cleanUpOnCompositionEnd = listenEvent(
    textarea,
    "compositionend",
    () => {
      selectionStore._setComposition();
    }
  );
  observer.observe(textarea);
  return () => {
    cleanUpOnFocus();
    cleanUpOnBlur();
    cleanUpOnScroll();
    cleanUpOnMouseDown();
    cleanUpOnMouseUp();
    cleanUpOnMouseMove();
    cleanUpOnMouseLeave();
    cleanUpOnClick();
    cleanUpOnInput();
    cleanUpOnCompositionStart();
    cleanUpOnCompositionUpdate();
    cleanUpOnCompositionEnd();
    observer.disconnect();
  };
};
