import type { TravelParameters, TimelineYear } from "@/types"

export function computeTravelForYear(
  timeline: TimelineYear,
  params: TravelParameters
): number {
  if (timeline.userAge > params.stopAge) {
    return 0
  }

  return params.currentAnnualCost * Math.pow(1 + params.inflationPercent / 100, timeline.yearIndex)
}
