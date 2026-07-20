"use client"

"use client"

import { useState } from "react"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/sources/shadcn-ui/components/radix-nova/attachment"

export default function Preview() {
  const [visible, setVisible] = useState(true)

  if (!visible) {
    return (
      <button
        type="button"
        className="rounded-lg border px-3 py-2 text-sm"
        onClick={() => setVisible(true)}
      >
        Restore attachment
      </button>
    )
  }

  return (
    <Attachment className="w-full max-w-80">
      <AttachmentMedia>PDF</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>brief.pdf</AttachmentTitle>
        <AttachmentDescription>1.8 MB · Uploaded</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction size="sm" onClick={() => setVisible(false)}>
          Remove
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}
