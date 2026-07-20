"use client";

import {
  Bell,
  FileText,
  FolderClosed,
  LayoutGrid,
  Link,
  Table,
} from "lucide-react";
import { useState } from "react";
import { BloomMenu } from "@/registry/sources/beui/components/beui-bloom-menu/bloom-menu";

const items = [
  { label: "Document", icon: FileText },
  { label: "Board", icon: LayoutGrid },
  { label: "Table", icon: Table },
  { label: "Folder", icon: FolderClosed },
  { label: "Reminder", icon: Bell },
  { label: "Link", icon: Link },
];

export default function BeuiBloomMenuPreview() {
  const [message, setMessage] = useState(
    "Open the menu and choose an item type.",
  );

  return (
    <div className="grid min-h-96 w-full max-w-2xl place-items-center rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-5">
        <BloomMenu
          items={items}
          onSelect={(label) => setMessage(`${label} selected.`)}
        />
        <p
          aria-live="polite"
          className="min-h-5 text-sm text-zinc-500 dark:text-zinc-400"
        >
          {message}
        </p>
      </div>
    </div>
  );
}
