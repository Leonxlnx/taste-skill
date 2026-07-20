"use client";

import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex items-center justify-between gap-4 border border-[var(--line)] px-4 py-3">
      <code className="min-w-0 overflow-x-auto whitespace-nowrap text-sm">{command}</code>
      <button
        className="shrink-0 cursor-pointer border-0 bg-transparent px-2 py-1 text-sm underline decoration-1 underline-offset-4"
        onClick={copy}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
