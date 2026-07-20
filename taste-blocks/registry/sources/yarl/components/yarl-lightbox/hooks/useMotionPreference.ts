import * as React from "react";

export function useMotionPreference() {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery?.matches);
    const listener = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mediaQuery?.addEventListener?.("change", listener);
    return () => mediaQuery?.removeEventListener?.("change", listener);
  }, []);

  return reduceMotion;
}
