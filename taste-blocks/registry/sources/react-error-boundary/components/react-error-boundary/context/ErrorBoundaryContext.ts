import { createContext } from "react";

export type ErrorBoundaryContextType = {
  didCatch: boolean;
  error: unknown | null;
  resetErrorBoundary: (...args: unknown[]) => void;
};

export const ErrorBoundaryContext =
  createContext<ErrorBoundaryContextType | null>(null);
