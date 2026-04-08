import { useMemo } from "react"
import type { SchoolFeesChild } from "@/types/onboarding"
import { computeSchoolFeeCorpus, computeSipNeeded } from "@/engine"
import type { TabProps, UseSchoolFeesTabReturn, SchoolFeeChildViewData } from "../types/GoalTabs.types"

function computeChildView(child: SchoolFeesChild, index: number): SchoolFeeChildViewData {
  const yearsUntilSchoolStarts = Math.max(0, child.schoolStartingAge - child.childCurrentAge)
  const hikeEvery = child.feeHikeEveryNYears ?? 2
  const totalYears = child.totalSchoolYears ?? 12
  const expReturns = child.expectedReturns ?? 12

  const result = computeSchoolFeeCorpus({
    currentAnnualFee: child.currentSchoolFeeYearly,
    feeHikePercent: child.expectedInflationYearly,
    feeHikeEveryNYears: hikeEvery,
    yearsUntilSchoolStarts,
    totalSchoolYears: totalYears,
    nearReturn: Math.min(expReturns, 10) / 100,
    farReturn: expReturns / 100,
  })

  const notInSchool = yearsUntilSchoolStarts > 0
  const sipNeeded = notInSchool
    ? computeSipNeeded(result.totalLumpsumNeeded, result.effectiveReturn, yearsUntilSchoolStarts)
    : 0

  return {
    child, index, yearsUntilSchoolStarts, hikeEvery, totalYears, expReturns,
    totalFeeOutflow: result.totalFeeOutflow,
    totalLumpsumNeeded: result.totalLumpsumNeeded,
    sipNeeded,
    lumpsumEquity: result.lumpsumEquity,
    lumpsumDebt: result.lumpsumDebt,
    useDualBucket: result.useDualBucket,
    equityCount: result.feeSchedule.filter((e) => e.bucket === "equity").length,
    debtCount: result.feeSchedule.filter((e) => e.bucket === "debt").length,
    notInSchool,
    returnPct: Math.round(result.effectiveReturn * 100),
  }
}

export function useSchoolFeesTab({ data, updateGoalDetails }: TabProps): UseSchoolFeesTabReturn {
  const childCount = Math.max(data.profile.numberOfChildren, 1)

  const children: SchoolFeesChild[] = useMemo(() => {
    const existing = data.goalDetails.schoolFees ?? []
    return Array.from({ length: childCount }, (_, i) =>
      existing[i] ?? {
        label: `Child ${i + 1}`,
        childCurrentAge: 0,
        schoolStartingAge: 4,
        currentSchoolFeeYearly: 0,
        expectedInflationYearly: 11,
        feeHikeEveryNYears: 2,
        totalSchoolYears: 12,
        expectedReturns: 12,
      }
    )
  }, [childCount, data.goalDetails.schoolFees])

  const childViews = useMemo(
    () => children.map((child, idx) => computeChildView(child, idx)),
    [children],
  )

  function updateChild(index: number, patch: Partial<SchoolFeesChild>) {
    const updated = [...children]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ schoolFees: updated })
  }

  return { childViews, updateChild }
}
