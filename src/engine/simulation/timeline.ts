import type { BaseProfile, ChildProfile, TimelineYear } from "@/types"

export function generateTimeline(
  baseProfile: BaseProfile,
  children: ChildProfile[]
): TimelineYear[] {
  const { currentYear, currentAge, retirementAge, lifeExpectancyAge } = baseProfile
  const totalYears = lifeExpectancyAge - currentAge + 1
  const timeline: TimelineYear[] = []

  for (let i = 0; i < totalYears; i++) {
    const userAge = currentAge + i
    const isRetired = userAge >= retirementAge
    const yearsToRetirement = isRetired ? 0 : retirementAge - userAge
    const yearsInRetirement = isRetired ? userAge - retirementAge : 0

    timeline.push({
      yearIndex: i,
      calendarYear: currentYear + i,
      userAge,
      isRetired,
      yearsToRetirement,
      yearsInRetirement,
      childAges: children.map((child) => child.currentAge + i),
    })
  }

  return timeline
}
