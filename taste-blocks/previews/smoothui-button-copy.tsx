"use client";

import ButtonCopy from "@/registry/sources/smoothui/components/smoothui-button-copy";

export default function SmoothUIButtonCopyPreview() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm">
      <code>SmoothUI copy button</code>
      <ButtonCopy
        onCopy={() => navigator.clipboard.writeText("SmoothUI copy button")}
      />
    </div>
  );
}
