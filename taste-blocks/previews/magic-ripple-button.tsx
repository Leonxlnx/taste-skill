"use client"

import { RippleButton } from "@/registry/sources/magic-ui/components/magic-ripple-button/ripple-button"

export default function MagicRippleButtonPreview() {
  return (
    <RippleButton
      className="border-neutral-950 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
      rippleColor="#94a3b8"
    >
      Save changes
    </RippleButton>
  )
}
