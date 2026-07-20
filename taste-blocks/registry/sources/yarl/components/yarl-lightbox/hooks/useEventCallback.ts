import * as React from "react";

import { useLayoutEffect } from "./useLayoutEffect.js";

export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  const ref = React.useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return React.useCallback((...args: Args) => ref.current?.(...args), []);
}
