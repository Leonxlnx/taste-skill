"use client"

"use client"

import InlineDiffComments from "@/registry/sources/eldora-ui/components/eldora-inline-diff-comments/inline-diff-comments"

export default function EldoraInlineDiffCommentsPreview() {
  return (
    <div className="mx-auto w-full max-w-3xl p-3 sm:p-6">
      <InlineDiffComments
        fileName="src/format.ts"
        diff={[
          { kind: "hunk", content: "@@ -18,4 +18,5 @@" },
          {
            kind: "context",
            old: 18,
            new: 18,
            content: "export function formatLabel(value: string) {",
          },
          {
            kind: "del",
            old: 19,
            new: null,
            content: "  return value.trim()",
          },
          {
            kind: "add",
            old: null,
            new: 19,
            content: "  const label = value.trim()",
          },
          {
            kind: "add",
            old: null,
            new: 20,
            content: "  return label || 'Untitled'",
          },
          { kind: "context", old: 20, new: 21, content: "}" },
        ]}
      />
    </div>
  )
}
