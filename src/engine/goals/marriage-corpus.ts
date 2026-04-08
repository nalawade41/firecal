const DEFAULT_EQUITY_CAGR = 0.12
const DEFAULT_BUFFER_PERCENT = 0.075

export interface MarriageCorpusResult {
  inflatedCorpus: number
  targetCorpus: number
  lumpsumNeeded: number
  sipNeeded: number
}

/**
 * Calculate inflated marriage corpus (with safety buffer), lumpsum, and monthly SIP.
 *
 *   inflatedCorpus = todaysBudget × (1 + inflationRate) ^ horizonYears
 *   targetCorpus   = inflatedCorpus × (1 + bufferPercent)
 *   lumpsumNeeded   = targetCorpus / (1 + equityCAGR) ^ horizonYears
 *   SIP (annuity due): targetCorpus × r / ((1+r)^n − 1) / (1+r)
 *
 * @param todaysBudget   Current estimated budget
 * @param inflationRate  Expected inflation (decimal, e.g. 0.05)
 * @param horizonYears   Years until marriage
 * @param equityCAGR     Expected equity CAGR (default 12%)
 * @param bufferPercent  Safety buffer (default 7.5%)
 */
export function computeMarriageCorpus(
  todaysBudget: number,
  inflationRate: number,
  horizonYears: number,
  equityCAGR: number = DEFAULT_EQUITY_CAGR,
  bufferPercent: number = DEFAULT_BUFFER_PERCENT,
): MarriageCorpusResult {
  const empty: MarriageCorpusResult = { inflatedCorpus: 0, targetCorpus: 0, lumpsumNeeded: 0, sipNeeded: 0 }

  if (todaysBudget <= 0 || horizonYears <= 0) return empty

  const inflatedCorpus = todaysBudget * Math.pow(1 + inflationRate, horizonYears)
  const targetCorpus = inflatedCorpus * (1 + bufferPercent)
  const lumpsumNeeded = targetCorpus / Math.pow(1 + equityCAGR, horizonYears)

  // Monthly SIP (annuity due — SIP at beginning of month)
  const r = equityCAGR / 12
  const n = horizonYears * 12
  const sipNeeded = targetCorpus * r / (Math.pow(1 + r, n) - 1) / (1 + r)

  return {
    inflatedCorpus: Math.round(inflatedCorpus),
    targetCorpus: Math.round(targetCorpus),
    lumpsumNeeded: Math.round(lumpsumNeeded),
    sipNeeded: Math.round(sipNeeded),
  }
}
