let supportsPassive: boolean | undefined;

const detectPassiveSupport = () => {
  if (supportsPassive !== undefined) return supportsPassive;

  if (typeof window === "undefined") return false;
  supportsPassive = false;

  const listener = () => {};
  try {
    const options = Object.defineProperty({}, "passive", {
      get() {
        supportsPassive = true;
      },
    });
    window.addEventListener("test", listener, options);
    window.removeEventListener("test", listener, options);
  } catch {
    // Passive event options are optional.
  }

  return supportsPassive;
};

export const Events = {
  isSupportsPassive: detectPassiveSupport,
  on(
    el: Element | Window | Document,
    type: string,
    callback: EventListener,
    options: AddEventListenerOptions | boolean = { passive: false }
  ) {
    el.addEventListener(
      type,
      callback,
      detectPassiveSupport() ? options : false
    );
  },

  off(
    el: Element | Window | Document,
    type: string,
    callback: EventListener,
    options: AddEventListenerOptions | boolean = { passive: false }
  ) {
    el.removeEventListener(
      type,
      callback,
      detectPassiveSupport() ? options : false
    );
  },
};
