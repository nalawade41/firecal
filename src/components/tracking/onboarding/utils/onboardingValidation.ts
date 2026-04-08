import type { OnboardingData } from "@/types/onboarding"

export function isStepValid(stepId: string, data: OnboardingData): boolean {
  switch (stepId) {
    case "profile":
      return data.profile.currentAge > 0 && data.profile.retirementAge > 0 && data.profile.lifeExpectancy > 0
    case "expenses":
      return data.expenses.annualHouseholdExpense > 0 && data.expenses.expenseInflationPercent > 0
    case "goal-selection":
      return data.selectedGoals.length > 0
    case "goal-details":
      return validateGoalDetails(data)
    case "lumpsum":
      return validateEntries(data.lumpsumInvestments as unknown as Record<string, unknown>[], ["fundName", "amount", "dateOfInvestment", "units", "goalId"])
    case "sip":
      return validateEntries(data.sipInvestments as unknown as Record<string, unknown>[], ["fundName", "amount", "startDate", "unitsTillNow", "goalId"])
    case "other-assets":
      return true
    case "confirmation":
      return true
    default:
      return true
  }
}

function validateEntries(entries: Record<string, unknown>[], requiredKeys: string[]): boolean {
  if (entries.length === 0) return true
  return entries.every((entry) =>
    requiredKeys.every((key) => {
      const val = entry[key]
      if (typeof val === "string") return val.trim().length > 0
      if (typeof val === "number") return val > 0
      return !!val
    })
  )
}

function validateGoalDetails(data: OnboardingData): boolean {
  const { selectedGoals, goalDetails, customGoalDefinitions } = data

  for (const goal of selectedGoals) {
    switch (goal) {
      case "fire": {
        const f = goalDetails.fire
        if (!f || f.targetAge <= 0 || f.inflationAssumed <= 0) return false
        break
      }
      case "school-fees": {
        const arr = goalDetails.schoolFees
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((c) => c.currentSchoolFeeYearly <= 0 || c.expectedInflationYearly <= 0)) return false
        break
      }
      case "graduation": {
        const arr = goalDetails.graduation
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((g) => g.graduationCostCurrent <= 0 || g.expectedInflationYearly <= 0)) return false
        break
      }
      case "marriage": {
        const arr = goalDetails.marriage
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((m) => m.marriageCostCurrent <= 0 || m.yearsRemaining <= 0 || m.expectedInflationYearly <= 0)) return false
        break
      }
      case "house-down-payment": {
        const h = goalDetails.houseDownPayment
        if (!h || h.targetCost <= 0 || h.yearsRemaining <= 0) return false
        break
      }
      case "whitegoods": {
        const arr = goalDetails.whitegoods
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((w) => !w.itemName.trim() || w.currentCost <= 0 || w.replacementFrequencyYears <= 0)) return false
        break
      }
      case "custom": {
        const arr = goalDetails.custom
        if (!Array.isArray(arr) || arr.length < customGoalDefinitions.length) return false
        if (arr.some((c) => c.targetCost <= 0 || c.yearsRemaining <= 0)) return false
        break
      }
    }
  }
  return true
}
