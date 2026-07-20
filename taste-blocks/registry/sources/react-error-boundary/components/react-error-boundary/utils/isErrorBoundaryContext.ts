import type { ErrorBoundaryContextType } from "../context/ErrorBoundaryContext";

export function isErrorBoundaryContext(
  value: unknown,
): value is ErrorBoundaryContextType {
  return (
    value !== null &&
    typeof value === "object" &&
    "didCatch" in value &&
    typeof value.didCatch === "boolean" &&
    "error" in value &&
    "resetErrorBoundary" in value &&
    typeof value.resetErrorBoundary === "function"
  );
}
