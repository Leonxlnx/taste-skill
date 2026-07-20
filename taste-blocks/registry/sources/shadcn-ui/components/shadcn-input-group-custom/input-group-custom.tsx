"use client"

import type * as React from "react"
import TextareaAutosize from "react-textarea-autosize"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "../radix-nova/input-group"

export default function InputGroupCustom({
  onSubmit,
  submitLabel = "Submit",
  textareaProps,
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>
  submitLabel?: React.ReactNode
  textareaProps?: React.ComponentProps<typeof TextareaAutosize>
}) {
  return (
    <form className="grid w-full max-w-sm gap-6" onSubmit={onSubmit}>
      <InputGroup>
        <TextareaAutosize
          {...textareaProps}
          data-slot="input-group-control"
          className={`flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none motion-reduce:transition-none md:text-sm ${textareaProps?.className ?? ""}`}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            type="submit"
            className="ms-auto"
            size="sm"
            variant="default"
          >
            {submitLabel}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
