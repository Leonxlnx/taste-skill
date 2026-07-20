import QR from "qrcode";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  "aria-label": string;
  data: string;
  foreground: string;
  background: string;
  robustness?: "L" | "M" | "Q" | "H";
};

export const QRCode = async ({
  data,
  foreground,
  background,
  robustness = "M",
  className,
  ...props
}: QRCodeProps) => {
  const svg = await QR.toString(data, {
    type: "svg",
    color: {
      dark: foreground,
      light: background,
    },
    width: 200,
    errorCorrectionLevel: robustness,
  });

  if (!svg) {
    throw new Error("Failed to generate QR code");
  }

  return (
    <div
      className={cn("size-full", "[&_svg]:size-full", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SVG"
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
      {...props}
    />
  );
};
