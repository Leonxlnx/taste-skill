"use client"

import {
  Meter,
  MeterLabel,
  MeterValue,
} from "@/registry/sources/9ui/components/9ui-meter/meter"

export default function NineUiMeterPreview() {
  return (
    <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5" dir="rtl" lang="ar">
      <Meter
        min={0}
        max={100}
        value={68}
        getAriaValueText={(_, value) => `${value} غيغابايت مستخدمة من أصل 100`}
      >
        <div className="flex items-baseline justify-between gap-4">
          <MeterLabel>مساحة التخزين المستخدمة</MeterLabel>
          <MeterValue>{(_, value) => `${value} غيغابايت`}</MeterValue>
        </div>
      </Meter>
    </section>
  )
}
