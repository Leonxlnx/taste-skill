"use client";

import { useState } from "react";
import { WheelPicker } from "@/registry/sources/beui/components/beui-wheel-picker/wheel-picker";

const hours = Array.from({ length: 12 }, (_, index) => ({
  label: `${String(index + 1).padStart(2, "0")}:00`,
  value: String(index + 1),
}));

export default function BeuiWheelPickerPreview() {
  const [hour, setHour] = useState("6");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <WheelPicker
        aria-label="Appointment hour"
        className="w-44"
        options={hours}
        value={hour}
        onValueChange={setHour}
      />
      <p
        aria-live="polite"
        className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400"
      >
        Selected time: {hours.find((option) => option.value === hour)?.label}
      </p>
    </div>
  );
}
