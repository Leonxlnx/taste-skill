"use client"

"use client"

import { QRCode } from "@/registry/sources/kibo-ui/components/kibo-qr-code"

export default function KiboQRCodePreview() {
  return (
    <div className="size-48 rounded-2xl border bg-background p-4">
      <QRCode
        aria-label="QR code for the Taste Blocks component catalog"
        data="taste-blocks:kibo-qr-code"
        role="img"
      />
    </div>
  )
}
