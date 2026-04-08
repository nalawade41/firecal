import type {
  ChildProfile,
  MarriageParameters,
  TimelineYear,
  MarriageYearResult,
  YearlyMarriageResult,
} from "@/types"

export function computeMarriageForYear(
  timeline: TimelineYear,
  children: ChildProfile[],
  params: MarriageParameters
): YearlyMarriageResult {
  const perChild: MarriageYearResult[] = children.map((child, childIndex) => {
    const childAge = timeline.childAges[childIndex]

    if (childAge !== child.marriageAge) {
      return { childIndex, cost: 0 }
    }

    const cost =
      params.currentCostPerChild *
      Math.pow(1 + params.inflationPercent / 100, timeline.yearIndex)

    return { childIndex, cost }
  })

  const totalMarriageCost = perChild.reduce((sum, c) => sum + c.cost, 0)

  return { perChild, totalMarriageCost }
}
