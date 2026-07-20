import * as React from "react";

import { makeUseContext } from "../utils.js";

export type A11yContextType = {
  focusWithin: boolean;
  trackFocusWithin: (
    onFocus?: React.FocusEventHandler,
    onBlur?: React.FocusEventHandler,
  ) => {
    onFocus: React.FocusEventHandler;
    onBlur: React.FocusEventHandler;
  };
  autoPlaying: boolean;
  setAutoPlaying: (value: boolean) => void;
};

export const A11yContext = React.createContext<A11yContextType | null>(null);

export const useA11yContext = makeUseContext("useA11yContext", "A11yContext", A11yContext);

export function A11yContextProvider({ children }: React.PropsWithChildren) {
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [autoPlaying, setAutoPlaying] = React.useState(false);

  const context = React.useMemo(() => {
    const trackFocusWithin: A11yContextType["trackFocusWithin"] = (onFocus, onBlur) => {
      const trackAndDelegate = (focusWithinValue: boolean) => (event: React.FocusEvent) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(focusWithinValue);
        }

        (focusWithinValue ? onFocus : onBlur)?.(event);
      };

      return {
        onFocus: trackAndDelegate(true),
        onBlur: trackAndDelegate(false),
      };
    };

    return { focusWithin, trackFocusWithin, autoPlaying, setAutoPlaying };
  }, [focusWithin, autoPlaying]);

  return <A11yContext.Provider value={context}>{children}</A11yContext.Provider>;
}
