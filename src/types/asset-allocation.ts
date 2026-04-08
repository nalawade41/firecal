// ── Asset Bucket (7 categories for portfolio breakdown) ───

export type AssetBucket =
  | "large_cap"
  | "mid_cap"
  | "small_cap"
  | "international"
  | "debt"
  | "gold"
  | "silver"

export const ASSET_BUCKETS: AssetBucket[] = [
  "large_cap",
  "mid_cap",
  "small_cap",
  "international",
  "debt",
  "gold",
  "silver",
]

export function emptyBuckets(): Record<AssetBucket, number> {
  return {
    large_cap: 0,
    mid_cap: 0,
    small_cap: 0,
    international: 0,
    debt: 0,
    gold: 0,
    silver: 0,
  }
}

// ── mfdata.in API response types ──────────────────────────

export interface MFDataSchemeInfo {
  family_id: number
  category: string
  name: string
}

export interface MFDataEquityHolding {
  stock_name: string
  sector: string
  isin: string | null
  weight_pct: number
  market_value: number
  quantity: number
}

export interface MFDataDebtHolding {
  name: string
  credit_rating: string
  weight_pct: number
}

export interface MFDataOtherHolding {
  name: string
  holding_type: string
  weight_pct: number
}

export interface MFDataFundHoldings {
  equity_pct: number
  debt_pct: number
  other_pct: number
  equity_holdings: MFDataEquityHolding[]
  debt_holdings: MFDataDebtHolding[]
  other_holdings: MFDataOtherHolding[]
}

// ── AMFI Classification ───────────────────────────────────

export type CapCategory = "large_cap" | "mid_cap" | "small_cap"

export interface AmfiClassificationEntry {
  isin: string
  company_name: string
  cap_category: CapCategory
}

// ── Classified holding (per stock, per fund) ──────────────

export type MatchMethod = "isin" | "name" | "alias" | "category_fallback"

export interface ClassifiedHolding {
  stockName: string
  isin: string | null
  normalizedName: string
  weightPct: number
  userValue: number
  bucket: AssetBucket
  matchMethod: MatchMethod
}

// ── Per-fund result ───────────────────────────────────────

export type AllocationSource = "look_through" | "category_fallback" | "failed"

export interface FundAllocationResult {
  schemeCode: string
  fundName: string
  goalId: string
  userValue: number
  source: AllocationSource
  buckets: Record<AssetBucket, number>
  holdings: ClassifiedHolding[]
  familyId: number | null
}

// ── Analytics ─────────────────────────────────────────────

export interface StockOverlap {
  stockName: string
  isin: string | null
  bucket: AssetBucket
  totalValue: number
  funds: { schemeCode: string; fundName: string; value: number }[]
}

export interface GoalAllocation {
  goalId: string
  goalLabel: string
  totalValue: number
  buckets: Record<AssetBucket, number>
  bucketPercents: Record<AssetBucket, number>
}

export interface TopHolding {
  stockName: string
  isin: string | null
  bucket: AssetBucket
  totalValue: number
  percentOfPortfolio: number
  funds: string[]
}

// ── Main result ───────────────────────────────────────────

export interface PortfolioAllocationResult {
  totalPortfolioValue: number
  buckets: Record<AssetBucket, number>
  bucketPercents: Record<AssetBucket, number>
  equityPercent: number

  funds: FundAllocationResult[]
  goals: GoalAllocation[]
  topHoldings: TopHolding[]
  overlaps: StockOverlap[]

  calculatedAt: string
  fundsWithLookThrough: number
  fundsWithFallback: number
  fundsFailed: number
}
