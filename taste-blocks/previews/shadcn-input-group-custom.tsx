"use client"

"use client"

import * as React from "react"

import InputGroupCustom from "@/registry/sources/shadcn-ui/components/shadcn-input-group-custom/input-group-custom"

export default function ShadcnInputGroupCustomPreview() {
  const [submitted, setSubmitted] = React.useState(false)

  return (
    <div className="grid gap-3 py-12">
      <InputGroupCustom
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
        }}
        textareaProps={{
          "aria-label": "Message",
          name: "message",
          placeholder: "Write a message…",
        }}
      />
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {submitted ? "Message submitted." : " "}
      </p>
    </div>
  )
}
