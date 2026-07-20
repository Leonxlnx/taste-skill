"use client";

import {
  Dock,
  DockIcon,
  DockItem,
  DockLabel,
} from "@/registry/sources/motion-primitives/components/motion-dock/dock";

const items = [
  ["Projects", "P"],
  ["Messages", "M"],
  ["Settings", "S"],
] as const;

export default function MotionDockPreview() {
  return (
    <Dock className="border border-zinc-200 bg-white shadow-lg dark:bg-zinc-900">
      {items.map(([label, glyph]) => (
        <DockItem
          aria-label={label}
          className="h-10 rounded-xl bg-zinc-100 text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          key={label}
        >
          <DockLabel>{label}</DockLabel>
          <DockIcon>
            <span aria-hidden="true" className="text-sm font-semibold">
              {glyph}
            </span>
          </DockIcon>
        </DockItem>
      ))}
    </Dock>
  );
}
