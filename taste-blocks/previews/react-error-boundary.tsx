"use client";

import { useEffect, useRef, useState } from "react";

import {
  ErrorBoundary,
  getErrorMessage,
  type FallbackProps,
} from "@/registry/sources/react-error-boundary/components/react-error-boundary";

function FailurePronePanel({
  onFail,
  shouldFail,
}: {
  onFail: () => void;
  shouldFail: boolean;
}) {
  if (shouldFail) {
    throw new Error("The preview widget failed during render.");
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-zinc-600">
        This content is rendered by a descendant of the boundary.
      </p>
      <button
        type="button"
        onClick={onFail}
        className="min-h-11 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
      >
        Trigger render error
      </button>
    </div>
  );
}

function RecoveryFallback({
  error,
  onRetry,
}: Pick<FallbackProps, "error"> & { onRetry: () => void }) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    regionRef.current?.focus();
  }, []);

  return (
    <div
      ref={regionRef}
      role="alert"
      aria-labelledby="error-boundary-heading"
      tabIndex={-1}
      className="grid gap-4 rounded-xl border border-red-200 bg-red-50 p-5 text-red-950 outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
    >
      <div className="grid gap-1">
        <h2 id="error-boundary-heading" className="font-semibold">
          This panel could not render
        </h2>
        <p className="text-sm text-red-800">
          {getErrorMessage(error) ?? "An unknown render error occurred."}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 w-fit rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
      >
        Retry panel
      </button>
    </div>
  );
}

export default function ReactErrorBoundaryPreview() {
  const [shouldFail, setShouldFail] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);

  return (
    <section className="grid w-full max-w-md gap-4 rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-sm">
      <div className="grid gap-1">
        <h1 className="text-lg font-semibold">Recoverable render failure</h1>
        <p className="text-sm text-zinc-600">
          Trigger a real descendant render error, then retry after clearing its cause.
        </p>
      </div>

      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <RecoveryFallback
            error={error}
            onRetry={() => {
              setShouldFail(false);
              setRecoveryCount((count) => count + 1);
              resetErrorBoundary();
            }}
          />
        )}
      >
        <FailurePronePanel
          shouldFail={shouldFail}
          onFail={() => setShouldFail(true)}
        />
      </ErrorBoundary>

      <p aria-live="polite" className="text-sm text-zinc-600">
        Successful recoveries: {recoveryCount}
      </p>
    </section>
  );
}
