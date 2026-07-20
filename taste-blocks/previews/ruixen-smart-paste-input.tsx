"use client";

import { SmartPasteInput } from "@/registry/sources/ruixen-ui/components/ruixen-smart-paste-input";

const sample = `Release checklist

Verify keyboard navigation and focus return.
Test the component at a narrow viewport.
Confirm that reduced motion removes unnecessary movement.
Run the production build before publishing.`;

export default function RuixenSmartPasteInputPreview() {
  return (
    <div className="w-full max-w-2xl">
      <SmartPasteInput
        defaultAttachments={[
          {
            id: "release-checklist",
            content: sample,
          },
        ]}
        label="Message with pasted attachments"
        placeholder="Write a message"
      />
    </div>
  );
}
