import type {
  InvestmentProfile,
  FireAssumptions,
  TimelineYear,
  YearlyPortfolioResult,
} from "@/types"
import { getEquityAllocation } from "../math/glidepath"

export function computePortfolioForYear(
  timeline: TimelineYear,
  openingBalance: number,
  withdrawalAmount: number,
  investmentProfile: InvestmentProfile,
  fireAssumptions: FireAssumptions
): YearlyPortfolioResult {
  const equityPercent = getEquityAllocation(
    timeline.userAge,
    fireAssumptions.glidepathCheckpoints
  )
  const debtPercent = 100 - equityPercent

  const blendedReturn =
    (equityPercent / 100) * (fireAssumptions.expectedEquityReturnPercent / 100) +
    (debtPercent / 100) * (fireAssumptions.expectedDebtReturnPercent / 100)

  if (!timeline.isRetired) {
    // Pre-retirement: contribute, no withdrawal
    const contribution =
      investmentProfile.annualSavings *
      Math.pow(
        1 + investmentProfile.annualSavingsIncreasePercent / 100,
        timeline.yearIndex
      )

    const baseAmount = openingBalance + contribution
    const returnAmount = baseAmount * blendedReturn
    const closingBalance = baseAmount + returnAmount

    return {
      openingBalance,
      contribution,
      withdrawal: 0,
      equityPercent,
      debtPercent,
      blendedReturn,
      returnAmount,
      closingBalance,
      isDepleted: false,
    }
  }

  // Post-retirement: withdraw, no contribution
  const remainingAfterWithdrawal = openingBalance - withdrawalAmount

  if (remainingAfterWithdrawal <= 0) {
    return {
      openingBalance,
      contribution: 0,
      withdrawal: withdrawalAmount,
      equityPercent,
      debtPercent,
      blendedReturn,
      returnAmount: 0,
      closingBalance: 0,
      isDepleted: true,
    }
  }

  const returnAmount = remainingAfterWithdrawal * blendedReturn
  const closingBalance = remainingAfterWithdrawal + returnAmount

  return {
    openingBalance,
    contribution: 0,
    withdrawal: withdrawalAmount,
    equityPercent,
    debtPercent,
    blendedReturn,
    returnAmount,
    closingBalance,
    isDepleted: false,
  }
}
