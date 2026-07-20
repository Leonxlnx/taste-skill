import * as React from "react";

import { useTimeouts } from "../contexts/Timeouts.js";

export function useDelay() {
  const timeoutId = React.useRef<number>(undefined);
  const { setTimeout, clearTimeout } = useTimeouts();

  return React.useCallback(
    (callback: () => void, delay: number) => {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(callback, delay > 0 ? delay : 0);
    },
    [setTimeout, clearTimeout],
  );
}
