"use client";

import ContextMenu, {
  type ContextMenuItemConfig,
} from "@/registry/sources/smoothui/components/smoothui-context-menu";
import { useState } from "react";

const initialText = "Focus this field, then press Shift+F10.";

export default function SmoothUIContextMenuPreview() {
  const [text, setText] = useState(initialText);
  const items: ContextMenuItemConfig[] = [
    {
      key: "transform",
      label: "Transform",
      children: [
        {
          key: "uppercase",
          label: "Uppercase",
          onSelect: () => setText((value) => value.toUpperCase()),
        },
        {
          key: "lowercase",
          label: "Lowercase",
          onSelect: () => setText((value) => value.toLowerCase()),
        },
      ],
    },
    { key: "separator", label: "", separator: true },
    {
      disabled: text === initialText,
      key: "reset",
      label: "Reset",
      onSelect: () => setText(initialText),
    },
    {
      disabled: text.length === 0,
      key: "clear",
      label: "Clear",
      onSelect: () => setText(""),
      variant: "destructive",
    },
  ];

  return (
    <ContextMenu items={items}>
      <textarea
        aria-label="Editable context-menu example"
        className="h-48 w-full max-w-80 resize-none rounded-2xl border bg-background p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onChange={(event) => setText(event.target.value)}
        value={text}
      />
    </ContextMenu>
  );
}
