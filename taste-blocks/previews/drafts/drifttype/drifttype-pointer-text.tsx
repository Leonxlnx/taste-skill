"use client";

import { PointerText } from "@/registry/sources/drifttype/components/drifttype-pointer-text/react/PointerText";

export default function DriftTypePointerTextPreview() {
  return (
    <div className="w-full max-w-4xl rounded-xl border bg-background p-6 text-foreground">
      <PointerText as="h2" font="56px system-ui, sans-serif" mode="repel">
        Pointer physics, without losing the words.
      </PointerText>
    </div>
  );
}
