import * as React from "react";

import { clsx, cssClass } from "../utils.js";
import { useEventCallback, useForkRef } from "../hooks/index.js";
import { DocumentContextProvider, RTLContextProvider, useA11yContext } from "../contexts/index.js";

export const LightboxRoot = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(function LightboxRoot(
  { className, children, onFocus, onBlur, ...rest },
  ref,
) {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [isRTL, setIsRTL] = React.useState(false);
  const { trackFocusWithin } = useA11yContext();

  // detect the RTL direction on every render to support dynamic `dir` attribute changes
  const detectRTL = useEventCallback(() => {
    if (nodeRef.current) {
      const rtl = window.getComputedStyle(nodeRef.current).direction === "rtl";
      if (rtl !== isRTL) {
        setIsRTL(rtl);
      }
    }
  });

  React.useEffect(detectRTL);

  return (
    <DocumentContextProvider nodeRef={nodeRef}>
      <RTLContextProvider isRTL={isRTL}>
        <div
          ref={useForkRef(ref, nodeRef)}
          className={clsx(cssClass("root"), className)}
          {...trackFocusWithin(onFocus, onBlur)}
          {...rest}
        >
          {children}
        </div>
      </RTLContextProvider>
    </DocumentContextProvider>
  );
});
