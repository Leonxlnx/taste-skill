"use client"

"use client"

import {
  RelativeTime,
  RelativeTimeZone,
  RelativeTimeZoneDate,
  RelativeTimeZoneDisplay,
  RelativeTimeZoneLabel,
} from "@/registry/sources/kibo-ui/components/kibo-relative-time"

const referenceTime = new Date("2026-07-20T12:00:00Z")
const zones = [
  { label: "UTC", zone: "UTC" },
  { label: "BER", zone: "Europe/Berlin" },
  { label: "TYO", zone: "Asia/Tokyo" },
]

export default function KiboRelativeTimePreview() {
  return (
    <RelativeTime className="w-full max-w-md rounded-xl border p-4" time={referenceTime}>
      {zones.map(({ label, zone }) => (
        <RelativeTimeZone key={zone} zone={zone}>
          <RelativeTimeZoneLabel>{label}</RelativeTimeZoneLabel>
          <RelativeTimeZoneDate />
          <RelativeTimeZoneDisplay />
        </RelativeTimeZone>
      ))}
    </RelativeTime>
  )
}
