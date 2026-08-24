"use client";
import clsx from "clsx";
import type { CallStatus } from "@/lib/api";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/status";

export function StatusBadge({ status }: { status: CallStatus }) {
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide", STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
