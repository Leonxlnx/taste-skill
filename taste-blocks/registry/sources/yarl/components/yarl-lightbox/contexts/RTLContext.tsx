import * as React from "react";

import { makeUseContext } from "../utils.js";

export type RTLContextType = {
  isRTL: boolean;
};

export const RTLContext = React.createContext<RTLContextType | null>(null);

export const useRTLContext = makeUseContext("useRTLContext", "RTLContext", RTLContext);

export type RTLContextProviderProps = React.PropsWithChildren & {
  isRTL: boolean;
};

export function RTLContextProvider({ isRTL, children }: RTLContextProviderProps) {
  const context = React.useMemo(() => ({ isRTL }), [isRTL]);

  return <RTLContext.Provider value={context}>{children}</RTLContext.Provider>;
}
