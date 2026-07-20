import { Component, createElement, type ErrorInfo } from "react";
import { ErrorBoundaryContext } from "../context/ErrorBoundaryContext";
import type { ErrorBoundaryProps, FallbackProps } from "../types";

const isDevelopment = process.env.NODE_ENV !== "production";

type ErrorBoundaryState =
  | {
      didCatch: true;
      error: unknown;
    }
  | {
      didCatch: false;
      error: null;
    };

const initialState: ErrorBoundaryState = {
  didCatch: false,
  error: null,
};

/**
 * A reusable React [error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) component.
 * Wrap this component around other React components to "catch" errors and render a fallback UI.
 *
 * Catches errors thrown while rendering the tree below it.
 *
 * Does not catch errors thrown during:
 * - Server side rendering
 * - Event handlers
 * - Errors thrown in the error boundary itself
 * - Async code that runs after rendering, like `setTimeout` callbacks or unresolved promises
 *
 * Event handler and async errors:
 *
 * - Use `useErrorBoundary` to pass caught errors to the nearest boundary
 * - In React 19, errors thrown from a function passed to the `startTransition` function returned by `useTransition`
 *   are caught by the nearest boundary
 *
 * ℹ️ The component provides several ways to render a fallback: `fallback`, `fallbackRender`, and `FallbackComponent`.
 * Refer to the documentation to determine which is best for your application.
 *
 * ℹ️ This is a **client component**. You can only pass props to it that are serializable or use it in files that have a `"use client";` directive.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }

  static getDerivedStateFromError(error: Error) {
    return { didCatch: true, error };
  }

  resetErrorBoundary(...args: unknown[]) {
    const { error } = this.state;

    if (error !== null) {
      this.props.onReset?.({
        args,
        reason: "imperative-api",
      });

      this.setState(initialState);
    }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState,
  ) {
    const { didCatch } = this.state;
    const { resetKeys } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (
      didCatch &&
      prevState.error !== null &&
      hasArrayChanged(prevProps.resetKeys, resetKeys)
    ) {
      this.props.onReset?.({
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys",
      });

      this.setState(initialState);
    }
  }

  render() {
    const { children, fallbackRender, FallbackComponent, fallback } =
      this.props;
    const { didCatch, error } = this.state;

    let childToRender = children;

    if (didCatch) {
      const props: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else if (fallback !== undefined) {
        childToRender = fallback;
      } else {
        if (isDevelopment) {
          console.error(
            "react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop",
          );
        }

        throw error;
      }
    }

    return createElement(
      ErrorBoundaryContext.Provider,
      {
        value: {
          didCatch,
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        },
      },
      childToRender,
    );
  }
}

function hasArrayChanged(a: unknown[] = [], b: unknown[] = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}
