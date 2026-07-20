"use client";

import { useState } from "react";
import {
  AnimatedToastStack,
  useAnimatedToastStack,
} from "@/registry/sources/beui/components/beui-toast-stack/toast-stack";

export default function BeuiToastStackPreview() {
  const [message, setMessage] = useState(
    "Use the controls to add local preview notices.",
  );
  const { toasts, showToast, updateToast, dismissToast, clearToasts } =
    useAnimatedToastStack({
      initialToasts: [
        {
          id: "preview-ready",
          title: "Preview ready",
          description: "This notice remains until you dismiss it.",
          status: "info",
          duration: 0,
        },
      ],
      limit: 4,
    });

  const addNotice = () => {
    const id = showToast({
      title: "Changes saved locally",
      description: "No request leaves this preview.",
      status: "success",
      duration: 0,
      action: {
        label: "Acknowledge",
        onClick: (toast) => {
          dismissToast(toast.id);
          setMessage("Notice acknowledged.");
        },
      },
    });
    setMessage(`Added ${id}.`);
  };

  return (
    <div className="flex min-h-80 w-full max-w-xl flex-col rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addNotice}
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-950"
        >
          Add notice
        </button>
        <button
          type="button"
          onClick={() => {
            updateToast("preview-ready", {
              title: "Preview updated",
              status: "success",
            });
            setMessage("Updated the first notice.");
          }}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-800"
        >
          Update first
        </button>
        <button
          type="button"
          onClick={() => {
            clearToasts();
            setMessage("All notices cleared.");
          }}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-800"
        >
          Clear
        </button>
      </div>
      <p
        aria-live="polite"
        className="mt-3 min-h-5 text-sm text-zinc-500 dark:text-zinc-400"
      >
        {message}
      </p>
      <div className="mt-auto pt-6">
        <AnimatedToastStack
          toasts={toasts}
          onDismiss={dismissToast}
          placement="static"
          className="w-full max-w-none"
        />
      </div>
    </div>
  );
}
