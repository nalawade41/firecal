import { useMemo } from "react"
import type { FireGoalDetails } from "@/types/onboarding"
import { computeFireCorpus, computeFireCorpusFinite, computeLumpsumNeeded, computeSipNeeded } from "@/engine"
import type { TabProps, UseFireTabReturn } from "../types/GoalTabs.types"

export function useFireTab({ data, updateGoalDetails, updateData }: TabProps): UseFireTabReturn {
  const fire: FireGoalDetails = data.goalDetails.fire ?? {
    targetAge: data.profile.retirementAge,
    safeWithdrawalRate: 2.5,
    inflationAssumed: 6,
    postRetirementReturn: 10,
    fireModel: "finite",
    expectedReturns: 12,
  }

  function update(patch: Partial<FireGoalDetails>) {
    const updated = { ...fire, ...patch }
    updateGoalDetails({ fire: updated })
    if (patch.targetAge !== undefined && updateData) {
      updateData({ profile: { ...data.profile, retirementAge: patch.targetAge } })
    }
  }

  const model = (fire.fireModel ?? "finite") as "finite" | "perpetual"
  const swr = fire.safeWithdrawalRate
  const postRetReturn = fire.postRetirementReturn ?? 10
  const preRetReturn = fire.expectedReturns ?? 12
  const yearsToFire = fire.targetAge - data.profile.currentAge
  const yearsInRetirement = data.profile.lifeExpectancy - fire.targetAge

  const expenseArgs = useMemo(() => ({
    currentAnnualHouseholdExpense: data.expenses.annualHouseholdExpense * 12,
    expenseInflationPercent: fire.inflationAssumed,
    expenseAdjustmentFactorAtRetirement: data.expenses.retirementAdjustmentFactor,
  }), [data.expenses.annualHouseholdExpense, fire.inflationAssumed, data.expenses.retirementAdjustmentFactor])

  const baseArgs = useMemo(() => ({
    currentAge: data.profile.currentAge,
    retirementAge: fire.targetAge,
    lifeExpectancyAge: data.profile.lifeExpectancy,
  }), [data.profile.currentAge, fire.targetAge, data.profile.lifeExpectancy])

  const swrResult = useMemo(
    () => computeFireCorpus(baseArgs, expenseArgs, swr / 100),
    [baseArgs, expenseArgs, swr],
  )
  const finiteResult = useMemo(
    () => computeFireCorpusFinite(baseArgs, expenseArgs, postRetReturn / 100),
    [baseArgs, expenseArgs, postRetReturn],
  )

  const selectedCorpus = model === "finite" ? finiteResult.corpusRequired : swrResult.corpusRequired
  const selectedLumpsum = useMemo(
    () => computeLumpsumNeeded(selectedCorpus, preRetReturn / 100, yearsToFire),
    [selectedCorpus, yearsToFire, preRetReturn],
  )
  const selectedSip = useMemo(
    () => computeSipNeeded(selectedCorpus, preRetReturn / 100, yearsToFire),
    [selectedCorpus, yearsToFire, preRetReturn],
  )

  const safeCorpus = (finiteResult.corpusRequired + swrResult.corpusRequired) / 2
  const safeLumpsum = useMemo(
    () => computeLumpsumNeeded(safeCorpus, preRetReturn / 100, yearsToFire),
    [safeCorpus, yearsToFire, preRetReturn],
  )
  const safeSip = useMemo(
    () => computeSipNeeded(safeCorpus, preRetReturn / 100, yearsToFire),
    [safeCorpus, yearsToFire, preRetReturn],
  )

  const swrWarning =
    swr > 3.5
      ? "Above standard — higher risk of outliving your corpus."
      : swr < 2.5
        ? "Very conservative — you may be saving more than necessary."
        : null

  return {
    fire, update, model, swr, postRetReturn, preRetReturn,
    yearsToFire, yearsInRetirement, lifeExpectancy: data.profile.lifeExpectancy,
    selectedCorpus, selectedLumpsum, selectedSip,
    safeCorpus, safeLumpsum, safeSip, swrWarning,
  }
}
