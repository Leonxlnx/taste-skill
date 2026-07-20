import type { ErrorBoundaryContextType } from "../context/ErrorBoundaryContext";
import { isErrorBoundaryContext } from "./isErrorBoundaryContext";

export function assertErrorBoundaryContext(
  value: unknown,
): asserts value is ErrorBoundaryContextType {
  if (!isErrorBoundaryContext(value)) {
    throw new Error("ErrorBoundaryContext not found");
  }
}
