import {
  createElement,
  forwardRef,
  type ComponentClass,
  type ComponentType,
} from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { ErrorBoundaryProps } from "../types";

export function withErrorBoundary<
  Type extends ComponentClass<unknown>,
  Props extends object,
>(Component: ComponentType<Props>, errorBoundaryProps: ErrorBoundaryProps) {
  const Wrapped = forwardRef<InstanceType<Type>, Props>((props, ref) =>
    createElement(
      ErrorBoundary,
      errorBoundaryProps,
      createElement(Component, { ...props, ref } as Props),
    ),
  );

  // Format for display in DevTools
  const name = Component.displayName || Component.name || "Unknown";
  Wrapped.displayName = `withErrorBoundary(${name})`;

  return Wrapped;
}
