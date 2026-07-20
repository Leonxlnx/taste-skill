"use client";

export { ErrorBoundary } from "./components/ErrorBoundary";
export { ErrorBoundaryContext } from "./context/ErrorBoundaryContext";
export { useErrorBoundary } from "./hooks/useErrorBoundary";
export { getErrorMessage } from "./utils/getErrorMessage";
export { withErrorBoundary } from "./utils/withErrorBoundary";

export type { ErrorBoundaryContextType } from "./context/ErrorBoundaryContext";
export type { UseErrorBoundaryApi } from "./hooks/useErrorBoundary";
export type {
  ErrorBoundaryProps,
  ErrorBoundaryPropsWithComponent,
  ErrorBoundaryPropsWithFallback,
  ErrorBoundaryPropsWithRender,
  FallbackProps,
  OnErrorCallback,
} from "./types";
