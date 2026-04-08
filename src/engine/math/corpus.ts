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
