"use client"

"use client"

import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/registry/sources/kibo-ui/components/kibo-contribution-graph"

const day = 86_400_000
const start = Date.UTC(2026, 0, 1)
const activities = Array.from({ length: 98 }, (_, index) => {
  const count = (index * 7 + index % 5) % 13
  return {
    date: new Date(start + index * day).toISOString().slice(0, 10),
    count,
    level: Math.min(4, Math.ceil(count / 3)),
  }
})

export default function KiboContributionGraphPreview() {
  return (
    <ContributionGraph className="w-full max-w-3xl" data={activities}>
      <ContributionGraphCalendar>
        {({ activity, dayIndex, weekIndex }) => (
          <ContributionGraphBlock
            activity={activity}
            dayIndex={dayIndex}
            weekIndex={weekIndex}
          />
        )}
      </ContributionGraphCalendar>
      <ContributionGraphFooter>
        <ContributionGraphTotalCount />
        <ContributionGraphLegend />
      </ContributionGraphFooter>
    </ContributionGraph>
  )
}
