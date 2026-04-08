import { useMemo } from "react"
import type { StepProps } from "@/types/onboarding"
import { computeFireCorpus } from "@/engine"
import type { UseStepExpensesReturn } from "../types/Steps.types"

export function useStepExpenses({ data, updateData }: StepProps): UseStepExpensesReturn {
  function update<K extends keyof typeof data.expenses>(key: K, value: typeof data.expenses[K]) {
    updateData({ expenses: { ...data.expenses, [key]: value } })
  }

  const fireResult = useMemo(
    () =>
      computeFireCorpus(
        {
          currentAge: data.profile.currentAge,
          retirementAge: data.profile.retirementAge,
          lifeExpectancyAge: data.profile.lifeExpectancy,
        },
        {
          currentAnnualHouseholdExpense: data.expenses.annualHouseholdExpense * 12,
          expenseInflationPercent: data.expenses.expenseInflationPercent,
          expenseAdjustmentFactorAtRetirement: data.expenses.retirementAdjustmentFactor,
        },
      ),
    [
      data.expenses.annualHouseholdExpense,
      data.expenses.expenseInflationPercent,
      data.expenses.retirementAdjustmentFactor,
      data.profile.currentAge,
      data.profile.retirementAge,
      data.profile.lifeExpectancy,
    ],
  )

  return {
    update,
    corpusRequired: fireResult.corpusRequired,
    expenseAtRetirement: fireResult.expenseAtRetirement,
    swrUsed: fireResult.swrUsed,
  }
}
