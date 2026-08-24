"use client";
import clsx from "clsx";

export function QualityBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500 text-xs">-</span>;
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-700 rounded-full h-1.5">
        <div className={clsx("h-1.5 rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{pct.toFixed(0)}</span>
    </div>
  );
}
