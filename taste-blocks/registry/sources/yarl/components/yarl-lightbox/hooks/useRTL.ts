import { useRTLContext } from "../contexts/RTLContext.js";

export function useRTL() {
  return useRTLContext().isRTL;
}
