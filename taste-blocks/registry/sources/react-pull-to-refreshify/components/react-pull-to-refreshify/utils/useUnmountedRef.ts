import { useRef, useEffect } from "react";

export const useUnmountedRef = () => {
  const unmountedRef = useRef(false);
  useEffect(() => {
    unmountedRef.current = false;

    return () => {
      unmountedRef.current = true;
    };
  }, []);
  return unmountedRef;
};
