import { useRef } from "react";
import { refKey } from "./utils.js";

/**
 * @internal
 */
export const useStatic = <T>(init: () => T): T => {
  const ref = useRef<T>(undefined);
  return ref[refKey] || (ref[refKey] = init());
};
