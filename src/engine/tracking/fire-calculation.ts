import type { OnboardingData } from "@/types/onboarding"
import type { FireTargetType } from "@/types/dashboard"
import { computeFireCorpus, computeFireCorpusFinite } from "./fire-corpus"

export interface FireCalculationResult {
  targetType: FireTargetType
  targetCorpus: number
  currentCorpus: number
  progressPercent: number
  gap: number
  reqCagr: number
  targetSip: number
  lumpsumNeeded: number
  yearsToRetirement: number
  currentAge: number
  targetAge: number
}

/**
 * Calculate current FIRE corpus from onboarding data
 * Includes: Lumpsum investments + SIPs (unitsTillNow × NAV) + EPF + NPS tagged to FIRE
 */
export function calculateCurrentFireCorpus(
  data: OnboardingData,
  navCache: Record<string, number>, // schemeCode -> NAV
): number {
  const fireGoalId = "fire"

  // Lumpsum investments tagged to FIRE
  const lumpsumTotal = data.lumpsumInvestments
    .filter((inv) => inv.goalId === fireGoalId)
    .reduce((sum, inv) => sum + inv.amount, 0)

  // Active SIPs tagged to FIRE (unitsTillNow × current NAV)
  const sipTotal = data.sipInvestments
    .filter((sip) => sip.goalId === fireGoalId && sip.isActive)
    .reduce((sum, sip) => {
      const nav = navCache[sip.schemeCode] || 0
      return sum + sip.unitsTillNow * nav
    }, 0)

  // Other assets - EPF and NPS (pro-rated for FIRE based on goal selection)
  const epfNpsTotal = data.selectedGoals.includes("fire")
    ? (data.otherAssets.epf?.currentBalance || 0) + (data.otherAssets.nps?.currentBalance || 0)
    : 0

  return lumpsumTotal + sipTotal + epfNpsTotal
}

/**
 * Calculate the three FIRE target types
 */
export function calculateFireTargets(
  data: OnboardingData,
): {
  finite: number
  perpetual: number
  suggested: number
} {
  const profile = data.profile
  const expenses = data.expenses

  const base = {
    currentAge: profile.currentAge,
    retirementAge: profile.retirementAge,
    lifeExpectancyAge: profile.lifeExpectancy,
  }

  const expenseProfile = {
    currentAnnualHouseholdExpense: expenses.annualHouseholdExpense * 12, // Convert monthly to annual
    expenseInflationPercent: expenses.expenseInflationPercent,
    expenseAdjustmentFactorAtRetirement: expenses.retirementAdjustmentFactor,
  }

  // Perpetual target using 2.5% SWR (matching onboarding default)
  const perpetual = computeFireCorpus(base, expenseProfile, 0.025).corpusRequired

  // Finite target using growing annuity model
  const finite = computeFireCorpusFinite(base, expenseProfile, 0.1).corpusRequired

  // Suggested target: average of finite and perpetual (matching onboarding "Recommended Safe Target")
  const suggested = (finite + perpetual) / 2

  return { finite, perpetual, suggested }
}

/**
 * Calculate required CAGR to reach target from current corpus
 * Considering current SIPs running till retirement
 */
export function calculateReqCagr(
  currentCorpus: number,
  targetCorpus: number,
  yearsToRetirement: number,
  monthlySipAmount: number,
): number {
  if (targetCorpus <= 0 || yearsToRetirement <= 0) return 0
  if (currentCorpus >= targetCorpus) return 0

  // Future value of current corpus + SIPs needs to equal target
  // FV = PV × (1+r)^n + SIP × [((1+r)^n - 1) / r] × (1+r)
  // We need to solve for r (CAGR)

  // Binary search for CAGR between 0% and 50%
  let low = 0
  let high = 0.5 // 50%
  let cagr = 0

  for (let i = 0; i < 50; i++) {
    cagr = (low + high) / 2
    const fvCurrent = currentCorpus * Math.pow(1 + cagr, yearsToRetirement)

    // FV of SIP (assuming SIP grows at same rate)
    const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1
    const months = yearsToRetirement * 12
    const fvSip =
      monthlySipAmount *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate)

    const totalFv = fvCurrent + fvSip

    if (totalFv < targetCorpus) {
      low = cagr
    } else {
      high = cagr
    }
  }

  return Math.round(cagr * 100 * 10) / 10 // Round to 1 decimal place
}

/**
 * Calculate additional lumpsum needed considering:
 * - Current corpus will grow at expected return
 * - Existing SIPs will continue contributing
 * Returns the additional lumpsum to invest NOW to reach target
 */
export function calculateAdditionalLumpsumNeeded(
  targetCorpus: number,
  currentCorpus: number,
  monthlySipAmount: number,
  annualReturnRate: number,
  yearsToRetirement: number,
): number {
  if (targetCorpus <= 0 || yearsToRetirement <= 0) return 0
  if (currentCorpus >= targetCorpus) return 0

  // Future value of current corpus
  const fvCurrent = currentCorpus * Math.pow(1 + annualReturnRate, yearsToRetirement)

  // Future value of existing SIPs
  const monthlyRate = annualReturnRate / 12
  const months = yearsToRetirement * 12
  const fvSip =
    monthlySipAmount *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)

  // Shortfall = what we still need after current assets grow
  const shortfall = Math.max(0, targetCorpus - fvCurrent - fvSip)

  if (shortfall <= 0) return 0

  // Lumpsum needed now to cover the shortfall
  const lumpsumNeeded = shortfall / Math.pow(1 + annualReturnRate, yearsToRetirement)

  return Math.round(lumpsumNeeded)
}

/**
 * Calculate target SIP (current + additional) needed to reach target
 * If lumpsum is insufficient, this calculates additional SIP required
 */
export function calculateTargetSip(
  targetCorpus: number,
  currentCorpus: number,
  currentMonthlySip: number,
  annualReturnRate: number,
  yearsToRetirement: number,
): number {
  if (targetCorpus <= 0 || yearsToRetirement <= 0) return currentMonthlySip
  if (currentCorpus >= targetCorpus) return currentMonthlySip

  // Future value of current corpus
  const fvCurrent = currentCorpus * Math.pow(1 + annualReturnRate, yearsToRetirement)

  // Future value of current SIPs
  const monthlyRate = annualReturnRate / 12
  const months = yearsToRetirement * 12
  const fvCurrentSip =
    currentMonthlySip *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)

  // Shortfall after current assets
  const shortfall = Math.max(0, targetCorpus - fvCurrent - fvCurrentSip)

  if (shortfall <= 0) return currentMonthlySip

  // Additional SIP needed to cover shortfall
  const additionalSip =
    shortfall /
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))

  return Math.round(currentMonthlySip + additionalSip)
}
export function calculateFireDashboard(
  data: OnboardingData,
  targetType: FireTargetType,
  navCache: Record<string, number> = {},
): FireCalculationResult {
  const currentCorpus = calculateCurrentFireCorpus(data, navCache)
  const targets = calculateFireTargets(data)
  const targetCorpus = targets[targetType]

  const yearsToRetirement = data.profile.retirementAge - data.profile.currentAge

  // Calculate monthly SIP amount for FIRE goal
  const monthlySipForFire = data.sipInvestments
    .filter((sip) => sip.goalId === "fire" && sip.isActive)
    .reduce((sum, sip) => sum + sip.amount, 0)

  const progressPercent =
    targetCorpus > 0 ? Math.round((currentCorpus / targetCorpus) * 100 * 10) / 10 : 0

  const gap = Math.max(0, targetCorpus - currentCorpus)

  const reqCagr = calculateReqCagr(
    currentCorpus,
    targetCorpus,
    yearsToRetirement,
    monthlySipForFire,
  )

  // Get pre-retirement expected returns from FIRE goal details (default 12%)
  const fireDetails = data.goalDetails?.fire as { expectedReturns?: number } | undefined
  const preRetirementReturn = (fireDetails?.expectedReturns ?? 12) / 100

  // Calculate additional lumpsum needed (considering current assets will grow)
  const additionalLumpsum = calculateAdditionalLumpsumNeeded(
    targetCorpus,
    currentCorpus,
    monthlySipForFire,
    preRetirementReturn,
    yearsToRetirement,
  )

  // Total lumpsum = current + additional (though we show additional separately)
  const lumpsumNeeded = additionalLumpsum

  // Calculate target SIP (current + additional needed)
  const targetSip = calculateTargetSip(
    targetCorpus,
    currentCorpus,
    monthlySipForFire,
    preRetirementReturn,
    yearsToRetirement,
  )

  return {
    targetType,
    targetCorpus,
    currentCorpus,
    progressPercent,
    gap,
    reqCagr,
    targetSip,
    lumpsumNeeded,
    yearsToRetirement,
    currentAge: data.profile.currentAge,
    targetAge: data.profile.retirementAge,
  }
}
