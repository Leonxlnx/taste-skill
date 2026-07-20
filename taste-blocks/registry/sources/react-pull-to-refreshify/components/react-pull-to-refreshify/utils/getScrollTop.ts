export type ScrollParent = Element | Window;

/**
 * get element scroll top
 */
export const getScrollTop = (ele: ScrollParent | null): number => {
  if (
    !ele ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return 0;
  }

  if (
    ele === window ||
    ele === document.documentElement ||
    ele === document.body ||
    ele === document.scrollingElement
  ) {
    return Math.max(
      0,
      window.scrollY,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
  }

  return Math.max(0, (ele as Element).scrollTop);
};
