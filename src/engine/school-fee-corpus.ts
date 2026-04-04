// ── Defaults ─────────────────────────────────────────────
const DEFAULT_NEAR_RETURN = 0.10
const DEFAULT_FAR_RETURN = 0.12
const DEFAULT_GLIDE_PATH_YEARS = 3
const NEAR_HORIZON_YEARS = 2

// ── Types ────────────────────────────────────────────────
export interface SchoolFeeScheduleEntry {
  year: number
  fee: number
  yearsFromNow: number
  bucket: "equity" | "debt"
  pv: number
}

export interface SchoolFeeCorpusResult {
  feeSchedule: SchoolFeeScheduleEntry[]
  totalFeeOutflow: number
  lumpsumEquity: number
  lumpsumDebt: number
  totalLumpsumNeeded: number
  yearsToStart: number
  effectiveReturn: number
  useDualBucket: boolean
}

export interface SchoolFeeCorpusParams {
  currentAnnualFee: number
  feeHikePercent: number
  feeHikeEveryNYears: number
  yearsUntilSchoolStarts: number
  totalSchoolYears: number
  nearReturn?: number
  farReturn?: number
  glidePathYears?: number
}

/**
 * Calculate lumpsum needed TODAY to fund all future school fees.
 *
 * Strategy:
 *   - If child is in school or starts within 2 years → dual-bucket at 10%
 *     (equity+debt combo). Fees ≤ glidePathYears away go to DEBT bucket.
 *   - If child starts school in > 2 years → pure equity at 12%. All fees
 *     in EQUITY bucket (enough time for full equity exposure).
 *
 * Fee schedule uses step-function hikes based on ABSOLUTE calendar year:
 *   fee[y] = currentAnnualFee × (1 + hikeRate) ^ floor(absYear / hikeEveryN)
 */
export function computeSchoolFeeCorpus(params: SchoolFeeCorpusParams): SchoolFeeCorpusResult {
  const {
    currentAnnualFee,
    feeHikePercent,
    feeHikeEveryNYears,
    yearsUntilSchoolStarts,
    totalSchoolYears,
    nearReturn = DEFAULT_NEAR_RETURN,
    farReturn = DEFAULT_FAR_RETURN,
    glidePathYears = DEFAULT_GLIDE_PATH_YEARS,
  } = params

  const useDualBucket = yearsUntilSchoolStarts <= NEAR_HORIZON_YEARS
  const effectiveReturn = useDualBucket ? nearReturn : farReturn

  const empty: SchoolFeeCorpusResult = {
    feeSchedule: [],
    totalFeeOutflow: 0,
    lumpsumEquity: 0,
    lumpsumDebt: 0,
    totalLumpsumNeeded: 0,
    yearsToStart: yearsUntilSchoolStarts,
    effectiveReturn,
    useDualBucket,
  }

  if (currentAnnualFee <= 0 || totalSchoolYears <= 0 || feeHikeEveryNYears <= 0) return empty

  const hikeRate = feeHikePercent / 100
  const feeSchedule: SchoolFeeScheduleEntry[] = []
  let totalFeeOutflow = 0
  let lumpsumEquity = 0
  let lumpsumDebt = 0

  for (let y = 0; y < totalSchoolYears; y++) {
    const yearsFromNow = yearsUntilSchoolStarts + y
    // Hike cycle based on ABSOLUTE calendar year — same fee for all students in that year
    const hikeCycles = Math.floor(yearsFromNow / feeHikeEveryNYears)
    const fee = Math.round(currentAnnualFee * Math.pow(1 + hikeRate, hikeCycles))

    // Dual-bucket: near-term fees to debt, far-term to equity
    // Pure equity: everything in equity bucket
    const bucket: "equity" | "debt" =
      useDualBucket && yearsFromNow <= glidePathYears ? "debt" : "equity"
    const pv = fee / Math.pow(1 + effectiveReturn, yearsFromNow)

    feeSchedule.push({ year: y, fee, yearsFromNow, bucket, pv })
    totalFeeOutflow += fee

    if (bucket === "equity") {
      lumpsumEquity += pv
    } else {
      lumpsumDebt += pv
    }
  }

  return {
    feeSchedule,
    totalFeeOutflow,
    lumpsumEquity: Math.round(lumpsumEquity),
    lumpsumDebt: Math.round(lumpsumDebt),
    totalLumpsumNeeded: Math.round(lumpsumEquity + lumpsumDebt),
    yearsToStart: yearsUntilSchoolStarts,
    effectiveReturn,
    useDualBucket,
  }
}

// ── Verification ─────────────────────────────────────────
export interface SchoolFeeVerificationEntry {
  year: number
  fee: number
  openingBalance: number
  interest: number
  closingBalance: number
}

export interface SchoolFeeVerificationResult {
  entries: SchoolFeeVerificationEntry[]
  sufficient: boolean
  finalBalance: number
}

/**
 * Year-by-year cashflow verification — does the debt fund actually
 * last all school years without running dry?
 */
export function verifySchoolFeeCorpus(
  feeSchedule: SchoolFeeScheduleEntry[],
  lumpsumAmount: number,
  debtReturn: number = DEFAULT_NEAR_RETURN,
): SchoolFeeVerificationResult {
  const entries: SchoolFeeVerificationEntry[] = []
  let balance = lumpsumAmount

  for (const entry of feeSchedule) {
    const openingBalance = balance
    const interest = Math.round(balance * debtReturn)
    balance = balance + interest - entry.fee
    entries.push({
      year: entry.year,
      fee: entry.fee,
      openingBalance,
      interest,
      closingBalance: balance,
    })
  }

  return {
    entries,
    sufficient: balance >= 0,
    finalBalance: Math.round(balance),
  }
}
