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

  let pvOrdinary: number
  if (Math.abs(r - g) < 1e-6) {
    pvOrdinary = expenseAtRetirement * yearsInRetirement / (1 + r)
  } else {
    pvOrdinary =
      expenseAtRetirement *
      (1 - Math.pow((1 + g) / (1 + r), yearsInRetirement)) /
      (r - g)
  }

  const corpusRequired =
    timing === WithdrawalTiming.IMMEDIATE
      ? pvOrdinary * (1 + r) / (1 + g)
      : pvOrdinary

  return { expenseAtRetirement, corpusRequired, yearsInRetirement, postRetirementReturn }
}
