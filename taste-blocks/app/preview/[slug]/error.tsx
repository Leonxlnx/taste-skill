"use client";

export default function PreviewError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-white p-6 text-center text-neutral-950">
      <div>
        <h1 className="text-xl font-semibold">Preview failed</h1>
        <button className="mt-5 border border-neutral-950 px-4 py-2 text-sm" onClick={reset} type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
