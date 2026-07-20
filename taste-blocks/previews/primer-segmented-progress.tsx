"use client"

import type {CSSProperties} from 'react'

import {ProgressBar} from '@/registry/sources/primer-segmented-progress/components/primer-segmented-progress'

const segments = [
  {label: 'Completed', value: 46, bg: 'success.emphasis', color: '#1f883d'},
  {label: 'In progress', value: 32, bg: 'accent.emphasis', color: '#0969da'},
  {label: 'Failed', value: 7, bg: 'danger.emphasis', color: '#cf222e'},
] as const

const progressTokens = {
  '--bgColor-success-emphasis': segments[0].color,
  '--bgColor-accent-emphasis': segments[1].color,
  '--bgColor-danger-emphasis': segments[2].color,
} as CSSProperties

export default function PrimerSegmentedProgressPreview() {
  return (
    <section className="w-full max-w-xl min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-medium" id="release-validation-label">
            Release validation
          </h3>
          <p className="text-sm text-neutral-500">85 of 100 checks processed</p>
        </div>
        <span className="text-sm font-medium tabular-nums">85%</span>
      </div>

      <ProgressBar
        aria-labelledby="release-validation-label"
        barSize="large"
        className="w-full"
        role="group"
        style={progressTokens}
      >
        {segments.map(({bg, label, value}) => (
          <ProgressBar.Item
            aria-label={`${label} checks`}
            aria-valuetext={`${value} of 100 checks ${label.toLowerCase()}`}
            bg={bg}
            key={label}
            progress={value}
          />
        ))}
      </ProgressBar>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        {segments.map(({label, value, color}) => (
          <div className="flex min-w-0 items-center justify-between gap-3 sm:block" key={label}>
            <dt className="flex min-w-0 items-center gap-2 text-neutral-600">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{backgroundColor: color}} />
              <span className="truncate">{label}</span>
            </dt>
            <dd className="font-medium tabular-nums sm:mt-1">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
