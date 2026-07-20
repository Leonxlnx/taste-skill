"use client";

import { Archive, Copy, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { OverflowActions } from "@/registry/sources/beui/components/beui-overflow-actions/overflow-actions";

const primaryActions = [
  {
    id: "share",
    label: "Share",
    ariaLabel: "Share item",
    icon: <Share2 aria-hidden="true" />,
  },
  {
    id: "copy",
    label: "Copy",
    ariaLabel: "Copy item",
    icon: <Copy aria-hidden="true" />,
  },
];

const extraActions = [
  {
    id: "download",
    label: "Download",
    ariaLabel: "Download item",
    icon: <Download aria-hidden="true" />,
  },
  {
    id: "archive",
    label: "Archive",
    ariaLabel: "Archive item",
    icon: <Archive aria-hidden="true" />,
  },
];

export default function BeuiOverflowActionsPreview() {
  const [message, setMessage] = useState(
    "Open the extra actions or choose a visible action.",
  );

  return (
    <div className="flex min-h-64 w-full max-w-2xl flex-col items-center justify-center gap-6 overflow-x-auto rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <OverflowActions
        primaryActions={primaryActions}
        overflowActions={extraActions}
        collapseOnAction
        onAction={(item) =>
          setMessage(`${item.label} action triggered locally.`)
        }
        size="sm"
      />
      <p
        aria-live="polite"
        className="min-h-5 text-sm text-zinc-500 dark:text-zinc-400"
      >
        {message}
      </p>
    </div>
  );
}
