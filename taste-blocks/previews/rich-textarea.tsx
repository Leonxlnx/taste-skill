"use client"

"use client"

import { useState } from "react"

import { RichTextarea } from "@/registry/sources/rich-textarea/components/rich-textarea/textarea"

const initialValue =
  "Review the launch note today, then mark urgent details for the team."

const emphasized = new Set(["review", "today", "urgent"])

function decorate(value: string) {
  return value.split(/(\s+)/).map((part, index) => {
    const word = part.toLowerCase().replace(/[^a-z]+$/g, "")
    return emphasized.has(word) ? (
      <mark
        key={`${index}-${part}`}
        style={{
          borderRadius: "0.2em",
          color: "#713f12",
          backgroundColor: "#fef08a",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  })
}

export default function RichTextareaPreview() {
  const [value, setValue] = useState(initialValue)

  return (
    <section className="mx-auto grid w-full max-w-xl gap-3">
      <label htmlFor="rich-textarea-preview" className="text-sm font-medium">
        Project note
      </label>
      <RichTextarea
        id="rich-textarea-preview"
        name="projectNote"
        required
        dir="auto"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-describedby="rich-textarea-description"
        style={{
          width: "100%",
          height: 180,
          resize: "vertical",
          border: "1px solid #a3a3a3",
          borderRadius: 12,
          padding: 16,
          color: "#171717",
          backgroundColor: "#ffffff",
          font: "inherit",
          lineHeight: 1.6,
        }}
      >
        {decorate}
      </RichTextarea>
      <p id="rich-textarea-description" className="text-sm text-neutral-600">
        The native textarea remains editable while matching words are decorated.
      </p>
    </section>
  )
}
