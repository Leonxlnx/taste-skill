"use client";

import { CircuitBoard } from "@/registry/sources/componentry/components/componentry/circuit-board";

const nodes = [
  { id: "source", x: 70, y: 170, label: "Source", status: "active" as const },
  { id: "parse", x: 230, y: 90, label: "Parse", status: "processing" as const },
  { id: "check", x: 230, y: 250, label: "Check", status: "active" as const },
  { id: "index", x: 420, y: 170, label: "Index", status: "active" as const, size: "lg" as const },
  { id: "ready", x: 560, y: 170, label: "Ready", status: "active" as const },
];

const connections = [
  { from: "source", to: "parse" },
  { from: "source", to: "check" },
  { from: "parse", to: "index" },
  { from: "check", to: "index" },
  { from: "index", to: "ready" },
];

export default function ComponentryCircuitBoardPreview() {
  return (
    <div className="max-w-full overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <CircuitBoard
        connections={connections}
        height={340}
        label="Source processing circuit"
        nodes={nodes}
        variant="auto"
        width={630}
      />
    </div>
  );
}
