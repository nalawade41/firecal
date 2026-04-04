import { useMemo } from "react"
import type { OnboardingData } from "@/types/onboarding"
import type { DashboardData, FireSummary, GoalSummary, NetWorthBreakdown } from "@/types/dashboard"
import {
  computeFireCorpus,
  computeFireCorpusFinite,
  computeLumpsumNeeded,
  computeSipNeeded,
  computeSchoolFeeCorpus,
  computeGraduationCorpus,
  computeMarriageCorpus,
} from "@/engine"

const GOLD_PRICE_PER_GRAM = 7500
const SILVER_PRICE_PER_GRAM = 95

function computeNetWorth(data: OnboardingData): NetWorthBreakdown {
  const inv = data.investments
  const other = data.otherAssets

  const epf = inv.epf + (other.epf?.currentBalance ?? 0)
  const nps = inv.nps + (other.nps?.currentBalance ?? 0)
  const goldGrams = inv.goldGrams + (other.goldGrams ?? 0)
  const silverGrams = inv.silverGrams + (other.silverGrams ?? 0)
  const gold = goldGrams * GOLD_PRICE_PER_GRAM
  const silver = silverGrams * SILVER_PRICE_PER_GRAM
  const emergencyFund = inv.emergencyFund + (other.emergencyFund ?? 0)
  const savings = inv.savingsAccountBalance + (other.otherSavings ?? 0)

  const total =
    inv.mfPortfolio + epf + nps + inv.ppf + gold + silver + emergencyFund + savings + inv.otherAmount

  return {
    mfPortfolio: inv.mfPortfolio,
    epf,
    nps,
    ppf: inv.ppf,
    gold,
    silver,
    emergencyFund,
    savings,
    other: inv.otherAmount,
    total,
  }
}

function computeFireSummary(data: OnboardingData): FireSummary | null {
  const fire = data.goalDetails.fire
  if (!fire) return null

  const yearsToFire = fire.targetAge - data.profile.currentAge
  if (yearsToFire <= 0) return null

  const base = {
    currentAge: data.profile.currentAge,
    retirementAge: fire.targetAge,
    lifeExpectancyAge: data.profile.lifeExpectancy,
  }
  const expense = {
    currentAnnualHouseholdExpense: data.expenses.annualHouseholdExpense,
    expenseInflationPercent: fire.inflationAssumed,
    expenseAdjustmentFactorAtRetirement: data.expenses.retirementAdjustmentFactor,
  }

  const model = fire.fireModel ?? "finite"
  const preRetReturn = fire.expectedReturns ?? 12

  let corpusRequired: number
  let expenseAtRetirement: number

  if (model === "perpetual") {
    const result = computeFireCorpus(base, expense, fire.safeWithdrawalRate / 100)
    corpusRequired = result.corpusRequired
    expenseAtRetirement = result.expenseAtRetirement
  } else {
    const result = computeFireCorpusFinite(base, expense, (fire.postRetirementReturn ?? 10) / 100)
    corpusRequired = result.corpusRequired
    expenseAtRetirement = result.expenseAtRetirement
  }

  const lumpsumNeeded = computeLumpsumNeeded(corpusRequired, preRetReturn / 100, yearsToFire)
  const sipNeeded = computeSipNeeded(corpusRequired, preRetReturn / 100, yearsToFire)

  return {
    corpusRequired,
    expenseAtRetirement,
    lumpsumNeeded,
    sipNeeded,
    yearsToFire,
    model,
    expectedReturns: preRetReturn,
  }
}

function computeGoalSummaries(data: OnboardingData): GoalSummary[] {
  const goals: GoalSummary[] = []

  // School fees
  if (data.goalDetails.schoolFees) {
    for (const child of data.goalDetails.schoolFees) {
      const yearsUntilStart = Math.max(0, child.schoolStartingAge - child.childCurrentAge)
      const expRet = child.expectedReturns ?? 12
      const result = computeSchoolFeeCorpus({
        currentAnnualFee: child.currentSchoolFeeYearly,
        feeHikePercent: child.expectedInflationYearly,
        feeHikeEveryNYears: child.feeHikeEveryNYears ?? 2,
        yearsUntilSchoolStarts: yearsUntilStart,
        totalSchoolYears: child.totalSchoolYears ?? 12,
        nearReturn: Math.min(expRet, 10) / 100,
        farReturn: expRet / 100,
      })

      const horizon = yearsUntilStart + (child.totalSchoolYears ?? 12)
      const sipNeeded = yearsUntilStart > 0
        ? computeSipNeeded(result.totalLumpsumNeeded, expRet / 100, yearsUntilStart)
        : 0

      goals.push({
        id: `school-${child.label}`,
        type: "school-fees",
        label: child.label || "School Fees",
        icon: "🏫",
        targetCorpus: result.totalFeeOutflow,
        lumpsumNeeded: result.totalLumpsumNeeded,
        sipNeeded,
        horizonYears: horizon,
        expectedReturns: expRet,
        colorClass: "blue",
      })
    }
  }

  // Graduation
  if (data.goalDetails.graduation) {
    for (const entry of data.goalDetails.graduation) {
      const expRet = entry.expectedReturns ?? 12
      const result = computeGraduationCorpus(
        entry.graduationCostCurrent,
        entry.expectedInflationYearly / 100,
        entry.horizonYears,
        expRet / 100,
      )
      goals.push({
        id: `grad-${entry.label}`,
        type: "graduation",
        label: entry.label || "Graduation",
        icon: "🎓",
        targetCorpus: result.targetCorpus,
        lumpsumNeeded: result.lumpsumNeeded,
        sipNeeded: result.sipNeeded,
        horizonYears: entry.horizonYears,
        expectedReturns: expRet,
        colorClass: "purple",
      })
    }
  }

  // Marriage
  if (data.goalDetails.marriage) {
    for (const entry of data.goalDetails.marriage) {
      const expRet = entry.expectedReturns ?? 12
      const buffer = entry.bufferPercent ?? 7.5
      const result = computeMarriageCorpus(
        entry.marriageCostCurrent,
        entry.expectedInflationYearly / 100,
        entry.yearsRemaining,
        expRet / 100,
        buffer / 100,
      )
      goals.push({
        id: `marriage-${entry.label}`,
        type: "marriage",
        label: entry.label || "Marriage",
        icon: "💍",
        targetCorpus: result.targetCorpus,
        lumpsumNeeded: result.lumpsumNeeded,
        sipNeeded: result.sipNeeded,
        horizonYears: entry.yearsRemaining,
        expectedReturns: expRet,
        colorClass: "pink",
      })
    }
  }

  // House down payment
  if (data.goalDetails.houseDownPayment) {
    const h = data.goalDetails.houseDownPayment
    const inflation = h.inflationExpected ?? 7
    const expRet = h.expectedReturns ?? 12
    const inflated = Math.round(h.targetCost * Math.pow(1 + inflation / 100, h.yearsRemaining))
    const lumpsum = h.yearsRemaining > 0 ? computeLumpsumNeeded(inflated, expRet / 100, h.yearsRemaining) : inflated
    const sip = h.yearsRemaining > 0 ? computeSipNeeded(inflated, expRet / 100, h.yearsRemaining) : 0

    goals.push({
      id: "house",
      type: "house-down-payment",
      label: "House Down Payment",
      icon: "🏡",
      targetCorpus: inflated,
      lumpsumNeeded: lumpsum,
      sipNeeded: sip,
      horizonYears: h.yearsRemaining,
      expectedReturns: expRet,
      colorClass: "orange",
    })
  }

  // Whitegoods
  if (data.goalDetails.whitegoods) {
    for (const item of data.goalDetails.whitegoods) {
      const expRet = item.expectedReturns ?? 10
      const horizon = item.replacementFrequencyYears
      const inflated = Math.round(item.currentCost * Math.pow(1 + item.inflationExpected / 100, horizon))
      const lumpsum = horizon > 0 ? computeLumpsumNeeded(inflated, expRet / 100, horizon) : inflated
      const sip = horizon > 0 ? computeSipNeeded(inflated, expRet / 100, horizon) : 0

      goals.push({
        id: `wg-${item.itemName}`,
        type: "whitegoods",
        label: item.itemName || "White Goods",
        icon: "🛒",
        targetCorpus: inflated,
        lumpsumNeeded: lumpsum,
        sipNeeded: sip,
        horizonYears: horizon,
        expectedReturns: expRet,
        colorClass: "teal",
      })
    }
  }

  // Custom goals
  if (data.goalDetails.custom && data.customGoalDefinitions) {
    for (const entry of data.goalDetails.custom) {
      const def = data.customGoalDefinitions.find((d) => d.id === entry.goalId)
      const inflation = entry.inflationExpected ?? 6
      const expRet = entry.expectedReturns ?? 12
      const inflated = Math.round(entry.targetCost * Math.pow(1 + inflation / 100, entry.yearsRemaining))
      const lumpsum = entry.yearsRemaining > 0 ? computeLumpsumNeeded(inflated, expRet / 100, entry.yearsRemaining) : inflated
      const sip = entry.yearsRemaining > 0 ? computeSipNeeded(inflated, expRet / 100, entry.yearsRemaining) : 0

      goals.push({
        id: `custom-${entry.goalId}`,
        type: "custom",
        label: def?.name || "Custom Goal",
        icon: def?.icon || "✦",
        targetCorpus: inflated,
        lumpsumNeeded: lumpsum,
        sipNeeded: sip,
        horizonYears: entry.yearsRemaining,
        expectedReturns: expRet,
        colorClass: "indigo",
      })
    }
  }

  return goals
}

export function useDashboardData(data: OnboardingData): DashboardData {
  return useMemo(() => {
    const netWorth = computeNetWorth(data)
    const fire = data.selectedGoals.includes("fire") ? computeFireSummary(data) : null
    const goals = computeGoalSummaries(data)

    const totalMonthlySip =
      (fire?.sipNeeded ?? 0) + goals.reduce((sum, g) => sum + g.sipNeeded, 0)
    const totalLumpsumNeeded =
      (fire?.lumpsumNeeded ?? 0) + goals.reduce((sum, g) => sum + g.lumpsumNeeded, 0)

    return { netWorth, fire, goals, totalMonthlySip, totalLumpsumNeeded }
  }, [data])
}
