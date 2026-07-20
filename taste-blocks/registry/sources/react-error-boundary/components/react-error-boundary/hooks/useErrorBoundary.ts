import { useContext, useMemo, useState } from "react";
import { ErrorBoundaryContext } from "../context/ErrorBoundaryContext";
import { assertErrorBoundaryContext } from "../utils/assertErrorBoundaryContext";

type UseErrorBoundaryState =
  | { error: unknown; hasError: true }
  | { error: null; hasError: false };

export type UseErrorBoundaryApi = {
  error: unknown | null;
  resetBoundary: () => void;
  showBoundary: (error: unknown) => void;
};

/**
 * Convenience hook for imperatively showing or dismissing error boundaries.
 *
 * ⚠️ This hook must only be used within an `ErrorBoundary` subtree.
 */
export function useErrorBoundary(): {
  /**
   * The currently visible `Error` (if one has been thrown).
   */
  error: unknown | null;

  /**
   * Method to reset and retry the nearest active error boundary (if one is active).
   */
  resetBoundary: () => void;

  /**
   * Trigger the nearest error boundary to display the error provided.
   *
   * ℹ️ React handles errors thrown while rendering.
   * Errors thrown in event handlers, or after async code has run, will not be caught automatically.
   * This method is a way to imperatively show the nearest error boundary for those errors.
   */
  showBoundary: (error: unknown) => void;
} {
  const context = useContext(ErrorBoundaryContext);

  assertErrorBoundaryContext(context);

  const { error, resetErrorBoundary } = context;

  const [state, setState] = useState<UseErrorBoundaryState>({
    error: null,
    hasError: false,
  });

  const memoized = useMemo(
    () => ({
      error,
      resetBoundary: () => {
        resetErrorBoundary();
        setState({ error: null, hasError: false });
      },
      showBoundary: (error: unknown) =>
        setState({
          error,
          hasError: true,
        }),
    }),
    [error, resetErrorBoundary],
  );

  if (state.hasError) {
    throw state.error;
  }

  return memoized;
}
