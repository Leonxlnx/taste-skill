import * as React from "react";

import { useLayoutEffect } from "./useLayoutEffect.js";

export function useLoseFocus(focus: () => void, disabled = false) {
  const focused = React.useRef(false);

  useLayoutEffect(() => {
    if (disabled && focused.current) {
      focused.current = false;
      focus();
    }
  }, [disabled, focus]);

  const onFocus = React.useCallback(() => {
    focused.current = true;
  }, []);

  const onBlur = React.useCallback(() => {
    focused.current = false;
  }, []);

  return { onFocus, onBlur };
}
