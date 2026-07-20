"use client";

import { cn } from "./lib/utils";
import * as React from "react";

interface WebGLErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

export class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  public state: WebGLErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <WebGLFallback />;
    }
    return this.props.children;
  }
}

interface WebGLFallbackProps {
  className?: string | undefined;
  message?: string | undefined;
}

export function WebGLFallback({
  className,
  message = "Interactive WebGL content is unavailable on this device/browser.",
}: WebGLFallbackProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-900 px-4 text-center text-sm text-white/75",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p>{message}</p>
    </div>
  );
}
