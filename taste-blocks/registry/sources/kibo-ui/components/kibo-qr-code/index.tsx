"use client";

import { formatHex, oklch } from "culori";
import QR from "qrcode";
import { type HTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  "aria-label": string;
  data: string;
  foreground?: string;
  background?: string;
  robustness?: "L" | "M" | "Q" | "H";
};

const getHex = (color: string, fallback: [number, number, number]) =>
  formatHex(color.trim()) ??
  formatHex(
    oklch({ mode: "oklch", l: fallback[0], c: fallback[1], h: fallback[2] })
  );

export const QRCode = ({
  data,
  foreground,
  background,
  robustness = "M",
  className,
  ...props
}: QRCodeProps) => {
  const [svg, setSVG] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSVG(null);

    const generateQR = async () => {
      try {
        const styles = getComputedStyle(document.documentElement);
        const foregroundColor =
          foreground ?? styles.getPropertyValue("--foreground");
        const backgroundColor =
          background ?? styles.getPropertyValue("--background");

        const foregroundHex = getHex(
          foregroundColor,
          [0.21, 0.006, 285.885]
        );
        const backgroundHex = getHex(backgroundColor, [0.985, 0, 0]);

        const newSvg = await QR.toString(data, {
          type: "svg",
          color: {
            dark: foregroundHex,
            light: backgroundHex,
          },
          width: 200,
          errorCorrectionLevel: robustness,
          margin: 0,
        });

        if (!cancelled) {
          setSVG(newSvg);
        }
      } catch (err) {
        console.error(err);
      }
    };

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [data, foreground, background, robustness]);

  if (!svg) {
    return null;
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
