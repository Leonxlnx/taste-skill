"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerPopover,
} from "@/registry/sources/fluid-functionalism/components/color-picker";

const swatches = ["#111827", "#2563EB", "#7C3AED", "#DC2626", "#EA580C", "#16A34A"];

export default function FluidColorPickerPreview() {
  const [color, setColor] = useState("#2563EB");

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
      <ColorPicker
        value={color}
        onValueChange={setColor}
        swatches={swatches}
        hideEyedropper
      />
      <div className="flex min-w-32 flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card p-2 text-xs tabular-nums">
          <span
            aria-hidden="true"
            className="size-8 rounded-md border"
            style={{ backgroundColor: color }}
          />
          <output dir="ltr" aria-label="Selected color">{color}</output>
        </div>
        <ColorPickerPopover
          value={color}
          onValueChange={setColor}
          swatches={swatches}
          hideEyedropper
          triggerLabel="Fill"
          triggerLabelPosition="left"
          triggerShowRemove
          onTriggerRemove={() => setColor("#00000000")}
        />
      </div>
    </div>
  );
}
