const DEFAULT_EQUITY_CAGR = 0.12

export interface GraduationCorpusResult {
  targetCorpus: number
  lumpsumNeeded: number
  sipNeeded: number
}

/**
 * Calculate inflated graduation corpus, lumpsum, and monthly SIP.
 *
 *   targetCorpus = todaysCost × (1 + inflationRate) ^ horizonYears
 *   lumpsumNeeded = targetCorpus / (1 + equityCAGR) ^ horizonYears
 *   SIP (annuity due): targetCorpus × r / ((1+r)^n − 1) / (1+r)
 *     where r = equityCAGR / 12, n = horizonYears × 12
 *
 * @param todaysCost     Current cost of graduation (e.g. ₹20L)
 * @param inflationRate  Expected inflation (decimal, e.g. 0.05)
 * @param horizonYears   Years until graduation
 * @param equityCAGR     Expected equity CAGR (default 12%)
 */
export function computeGraduationCorpus(
  todaysCost: number,
  inflationRate: number,
  horizonYears: number,
  equityCAGR: number = DEFAULT_EQUITY_CAGR,
): GraduationCorpusResult {
  const empty: GraduationCorpusResult = { targetCorpus: 0, lumpsumNeeded: 0, sipNeeded: 0 }

  if (todaysCost <= 0 || horizonYears <= 0) return empty

  const targetCorpus = todaysCost * Math.pow(1 + inflationRate, horizonYears)
  const lumpsumNeeded = targetCorpus / Math.pow(1 + equityCAGR, horizonYears)

  // Monthly SIP (annuity due — SIP at beginning of month)
  const r = equityCAGR / 12
  const n = horizonYears * 12
  const sipNeeded = targetCorpus * r / (Math.pow(1 + r, n) - 1) / (1 + r)

  return {
    targetCorpus: Math.round(targetCorpus),
    lumpsumNeeded: Math.round(lumpsumNeeded),
    sipNeeded: Math.round(sipNeeded),
  }
}
