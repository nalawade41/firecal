import type { BaseProfile, ExpenseProfile } from "@/types"

const DEFAULT_SWR = 0.025
const DEFAULT_POST_RETIREMENT_RETURN = 0.10

export const WithdrawalTiming = {
  /** First withdrawal at start of retirement (annuity due) */
  IMMEDIATE: "immediate",
  /** First withdrawal at end of first retirement year (ordinary annuity) */
  END_OF_YEAR: "end_of_year",
} as const

export type WithdrawalTiming = (typeof WithdrawalTiming)[keyof typeof WithdrawalTiming]

export interface FireCorpusResult {
  expenseAtRetirement: number
  corpusRequired: number
  swrUsed: number
}

export interface FireCorpusFiniteResult {
  expenseAtRetirement: number
  corpusRequired: number
  yearsInRetirement: number
  postRetirementReturn: number
}

/**
 * Estimate the retirement corpus using the Safe Withdrawal Rate (SWR) approach.
 * Perpetual model — ignores retirement duration and post-retirement returns.
 *
 *   corpus = expenseAtRetirement / SWR
 *
 * @param base      Profile with currentAge, retirementAge, lifeExpectancyAge
 * @param expense   Expense profile with annual expense, inflation, adjustment factor
 * @param swr       Safe withdrawal rate (default 2.5%)
 */
export function computeFireCorpus(
  base: Pick<BaseProfile, "currentAge" | "retirementAge" | "lifeExpectancyAge">,
  expense: ExpenseProfile,
  swr: number = DEFAULT_SWR,
): FireCorpusResult {
  const yearsToRetirement = base.retirementAge - base.currentAge

  if (yearsToRetirement <= 0 || expense.currentAnnualHouseholdExpense <= 0 || swr <= 0) {
    return { expenseAtRetirement: 0, corpusRequired: 0, swrUsed: swr }
  }

  const g = expense.expenseInflationPercent / 100

  const expenseAtRetirement =
    expense.currentAnnualHouseholdExpense *
    expense.expenseAdjustmentFactorAtRetirement *
    Math.pow(1 + g, yearsToRetirement)

  const corpusRequired = expenseAtRetirement / swr

  return { expenseAtRetirement, corpusRequired, swrUsed: swr }
}

/**
 * Estimate the retirement corpus using a finite-horizon model.
 * Uses the Present Value of a Growing Annuity (Due) formula so the
 * corpus is sized to last exactly until `lifeExpectancyAge`.
 *
 * Growing annuity (ordinary):
 *   PV = PMT × [1 − ((1+g)/(1+r))^n] / (r − g)
 *
 * Converted to annuity due (first withdrawal at start of retirement):
 *   PV_due = PV × (1+r) / (1+g)
 *
 * @param base                 Profile with currentAge, retirementAge, lifeExpectancyAge
 * @param expense              Expense profile with annual expense, inflation, adjustment factor
 * @param postRetirementReturn Expected annual return on corpus during retirement (default 10%)
 * @param timing               When first withdrawal happens (default IMMEDIATE / annuity due)
 */
export function computeFireCorpusFinite(
  base: Pick<BaseProfile, "currentAge" | "retirementAge" | "lifeExpectancyAge">,
  expense: ExpenseProfile,
  postRetirementReturn: number = DEFAULT_POST_RETIREMENT_RETURN,
  timing: WithdrawalTiming = WithdrawalTiming.IMMEDIATE,
): FireCorpusFiniteResult {
  const yearsToRetirement = base.retirementAge - base.currentAge
  const yearsInRetirement = base.lifeExpectancyAge - base.retirementAge

  const empty: FireCorpusFiniteResult = {
    expenseAtRetirement: 0,
    corpusRequired: 0,
    yearsInRetirement,
    postRetirementReturn,
  }

  if (yearsToRetirement <= 0 || yearsInRetirement <= 0 || expense.currentAnnualHouseholdExpense <= 0) {
    return empty
  }

  const g = expense.expenseInflationPercent / 100
  const r = postRetirementReturn

  const expenseAtRetirement =
    expense.currentAnnualHouseholdExpense *
    expense.expenseAdjustmentFactorAtRetirement *
    Math.pow(1 + g, yearsToRetirement)

  // PV of growing annuity (ordinary)
  let pvOrdinary: number
  if (Math.abs(r - g) < 1e-6) {
    // Special case: r ≈ g → PV = PMT × n / (1 + r)
    pvOrdinary = expenseAtRetirement * yearsInRetirement / (1 + r)
  } else {
    pvOrdinary =
      expenseAtRetirement *
      (1 - Math.pow((1 + g) / (1 + r), yearsInRetirement)) /
      (r - g)
  }

  // Convert to annuity due if withdrawal is immediate
  const corpusRequired =
    timing === WithdrawalTiming.IMMEDIATE
      ? pvOrdinary * (1 + r) / (1 + g)
      : pvOrdinary

  return { expenseAtRetirement, corpusRequired, yearsInRetirement, postRetirementReturn }
}

/**
 * Lumpsum needed today to reach a target corpus at a given annual return.
 *   lumpsum = targetCorpus / (1 + r)^years
 */
export function computeLumpsumNeeded(
  targetCorpus: number,
  annualReturn: number,
  years: number,
): number {
  if (targetCorpus <= 0 || years <= 0) return 0
  return targetCorpus / Math.pow(1 + annualReturn, years)
}

/**
 * Monthly SIP needed to accumulate a target corpus at a given annual return.
 *   Uses the future-value-of-annuity formula solved for PMT:
 *   SIP = FV × r_m / ((1 + r_m)^months − 1)
 *   where r_m = (1 + annualReturn)^(1/12) − 1
 */
export function computeSipNeeded(
  targetCorpus: number,
  annualReturn: number,
  years: number,
): number {
  if (targetCorpus <= 0 || years <= 0) return 0
  const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1
  const months = years * 12
  return targetCorpus * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1)
}
