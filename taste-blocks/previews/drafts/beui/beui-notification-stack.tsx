"use client";

import { useState } from "react";
import { NotificationStack } from "@/registry/sources/beui/components/beui-notification-stack/notification-stack";

const notifications = [
  {
    id: "review",
    title: "Review requested",
    description: "A teammate requested feedback on the navigation update.",
    trailing: "2m",
  },
  {
    id: "build",
    title: "Build completed",
    description: "The preview deployment is ready to inspect.",
    trailing: "18m",
  },
  {
    id: "mention",
    title: "New mention",
    description: "You were mentioned in the release checklist.",
    trailing: "1h",
  },
];

export default function BeuiNotificationStackPreview() {
  const [message, setMessage] = useState(
    "Focus, hover, or tap the stack to expand it.",
  );

  return (
    <div className="flex min-h-96 w-full max-w-xl flex-col items-center justify-center gap-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <NotificationStack
        items={notifications}
        onViewAll={() => setMessage("View-all action triggered locally.")}
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
