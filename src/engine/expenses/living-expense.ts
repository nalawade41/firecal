import type { ExpenseProfile, TimelineYear } from "@/types"

export function computeLivingExpenseForYear(
  timeline: TimelineYear,
  params: ExpenseProfile
): number {
  const base =
    params.currentAnnualHouseholdExpense *
    Math.pow(1 + params.expenseInflationPercent / 100, timeline.yearIndex)

  if (timeline.isRetired) {
    return base * params.expenseAdjustmentFactorAtRetirement
  }

  return base
}
