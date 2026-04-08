/**
 * Calculate the monthly SIP required to accumulate a future value.
 *
 * Uses the standard future-value-of-annuity formula:
 *   FV = SIP × [((1 + r)^n - 1) / r] × (1 + r)
 *   where r = monthly rate, n = total months
 *
 * Solving for SIP:
 *   SIP = FV / {[((1 + r)^n - 1) / r] × (1 + r)}
 *
 * @param futureValue  - Total corpus needed (in future-value terms)
 * @param annualReturn - Expected annual return (e.g. 0.12 for 12%)
 * @param years        - Number of years to invest
 * @returns monthly SIP amount (0 if years <= 0 or futureValue <= 0)
 */
export function computeMonthlySip(
  futureValue: number,
  annualReturn: number,
  years: number
): number {
  if (futureValue <= 0 || years <= 0) return 0

  const monthlyRate = annualReturn / 12
  const totalMonths = Math.round(years * 12)

  if (monthlyRate === 0) {
    return futureValue / totalMonths
  }

  const compoundFactor = Math.pow(1 + monthlyRate, totalMonths)
  const fvAnnuity = ((compoundFactor - 1) / monthlyRate) * (1 + monthlyRate)

  return futureValue / fvAnnuity
}

/**
 * Binary-search for the exact monthly SIP that makes a portfolio end at ~₹0
 * after all cashflow withdrawals, given annual SIP contributions and returns.
 *
 * Simulates: each year → add annualSip → subtract withdrawal → grow at returnRate.
 * SIP contributions stop after `sipYears` years.
 * Finds the monthly SIP (annualSip = monthlySip * 12) where final balance ≈ 0.
 *
 * @param cashflows   - Array of { yearFromNow, amount } withdrawals
 * @param annualReturn - Annual return as decimal (e.g. 0.112 for 11.2%)
 * @param sipYears    - Number of years SIP is contributed (last cashflow year + 1)
 * @returns monthly SIP amount
 */
export function computeCashflowMatchingSip(
  cashflows: { yearFromNow: number; amount: number }[],
  annualReturn: number,
  sipYears: number
): number {
  if (cashflows.length === 0 || sipYears <= 0) return 0

  const totalFutureCost = cashflows.reduce((s, cf) => s + cf.amount, 0)
  if (totalFutureCost <= 0) return 0

  // Build year→withdrawal map
  const maxYear = Math.max(...cashflows.map((cf) => cf.yearFromNow))
  const simYears = maxYear + 1
  const withdrawalByYear: number[] = new Array(simYears).fill(0)
  for (const cf of cashflows) {
    if (cf.yearFromNow >= 0 && cf.yearFromNow < simYears) {
      withdrawalByYear[cf.yearFromNow] += cf.amount
    }
  }

  // Simulate portfolio for a given annual SIP, return final balance
  function simulate(annualSip: number): number {
    let balance = 0
    for (let y = 0; y < simYears; y++) {
      if (y < sipYears) balance += annualSip
      balance -= withdrawalByYear[y]
      if (balance < 0) balance = 0
      balance *= 1 + annualReturn
    }
    return balance
  }

  // Binary search: find monthlySip where simulate ends at ~0
  let lo = 0
  let hi = totalFutureCost / 12 // upper bound: pay everything as SIP in 1 year
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const finalBalance = simulate(mid * 12)
    if (finalBalance > 1) {
      hi = mid // SIP too high
    } else {
      lo = mid // SIP too low (balance goes negative / depleted)
    }
    if (hi - lo < 0.01) break
  }

  return Math.ceil((lo + hi) / 2)
}
