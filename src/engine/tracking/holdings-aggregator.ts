/**
 * Holdings aggregation engine.
 * Groups classified holdings into buckets, detects overlaps,
 * extracts top holdings, and groups by goal.
 */
import type {
  AssetBucket,
  ClassifiedHolding,
  FundAllocationResult,
  GoalAllocation,
  MFDataOtherHolding,
  StockOverlap,
  TopHolding,
} from "@/types/asset-allocation"
import { ASSET_BUCKETS, emptyBuckets } from "@/types/asset-allocation"

// ── Aggregate per-fund buckets ────────────────────────────

export function aggregateFundBuckets(
  classifiedHoldings: ClassifiedHolding[],
  debtPct: number,
  otherPct: number,
  userValue: number,
  otherHoldings: MFDataOtherHolding[],
): Record<AssetBucket, number> {
  const buckets = emptyBuckets()

  // Equity holdings: distribute proportionally by weight
  const totalEquityWeight = classifiedHoldings.reduce((sum, h) => sum + h.weightPct, 0)
  if (totalEquityWeight > 0) {
    for (const h of classifiedHoldings) {
      const fraction = h.weightPct / totalEquityWeight
      const equityShare = (1 - (debtPct + otherPct) / 100) * userValue
      buckets[h.bucket] += fraction * equityShare
    }
  }

  // Debt portion
  buckets.debt += (debtPct / 100) * userValue

  // Other portion: check for gold/silver ETFs, else treat as debt
  if (otherPct > 0) {
    const otherValue = (otherPct / 100) * userValue
    let allocated = 0

    for (const oh of otherHoldings) {
      const nameLower = oh.name.toLowerCase()
      if (nameLower.includes("gold")) {
        const share = (oh.weight_pct / otherPct) * otherValue
        buckets.gold += share
        allocated += share
      } else if (nameLower.includes("silver")) {
        const share = (oh.weight_pct / otherPct) * otherValue
        buckets.silver += share
        allocated += share
      }
    }

    // Remaining other goes to debt
    buckets.debt += otherValue - allocated
  }

  return buckets
}

// ── Detect overlapping stocks across funds ────────────────

export function detectOverlaps(funds: FundAllocationResult[]): StockOverlap[] {
  const stockMap = new Map<string, StockOverlap>()

  for (const fund of funds) {
    for (const h of fund.holdings) {
      const key = h.isin ?? h.normalizedName
      const existing = stockMap.get(key)

      if (existing) {
        existing.totalValue += h.userValue
        existing.funds.push({
          schemeCode: fund.schemeCode,
          fundName: fund.fundName,
          value: h.userValue,
        })
      } else {
        stockMap.set(key, {
          stockName: h.stockName,
          isin: h.isin,
          bucket: h.bucket,
          totalValue: h.userValue,
          funds: [{
            schemeCode: fund.schemeCode,
            fundName: fund.fundName,
            value: h.userValue,
          }],
        })
      }
    }
  }

  return [...stockMap.values()]
    .filter(o => o.funds.length > 1)
    .sort((a, b) => b.totalValue - a.totalValue)
}

// ── Top N holdings by user value ──────────────────────────

export function extractTopHoldings(
  funds: FundAllocationResult[],
  n: number,
): TopHolding[] {
  const stockMap = new Map<string, {
    stockName: string
    isin: string | null
    bucket: AssetBucket
    totalValue: number
    fundNames: Set<string>
  }>()

  for (const fund of funds) {
    for (const h of fund.holdings) {
      const key = h.isin ?? h.normalizedName
      const existing = stockMap.get(key)

      if (existing) {
        existing.totalValue += h.userValue
        existing.fundNames.add(fund.fundName)
      } else {
        stockMap.set(key, {
          stockName: h.stockName,
          isin: h.isin,
          bucket: h.bucket,
          totalValue: h.userValue,
          fundNames: new Set([fund.fundName]),
        })
      }
    }
  }

  const totalPortfolio = funds.reduce((sum, f) => sum + f.userValue, 0)

  return [...stockMap.values()]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, n)
    .map(s => ({
      stockName: s.stockName,
      isin: s.isin,
      bucket: s.bucket,
      totalValue: s.totalValue,
      percentOfPortfolio: totalPortfolio > 0
        ? Math.round((s.totalValue / totalPortfolio) * 1000) / 10
        : 0,
      funds: [...s.fundNames],
    }))
}

// ── Group by goal ─────────────────────────────────────────

export function groupByGoal(
  funds: FundAllocationResult[],
  goalLabels: Record<string, string>,
): GoalAllocation[] {
  const goalMap = new Map<string, { totalValue: number; buckets: Record<AssetBucket, number> }>()

  for (const fund of funds) {
    const existing = goalMap.get(fund.goalId)
    if (existing) {
      existing.totalValue += fund.userValue
      for (const b of ASSET_BUCKETS) {
        existing.buckets[b] += fund.buckets[b]
      }
    } else {
      goalMap.set(fund.goalId, {
        totalValue: fund.userValue,
        buckets: { ...fund.buckets },
      })
    }
  }

  return [...goalMap.entries()].map(([goalId, data]) => {
    const bucketPercents = emptyBuckets()
    if (data.totalValue > 0) {
      for (const b of ASSET_BUCKETS) {
        bucketPercents[b] = Math.round((data.buckets[b] / data.totalValue) * 1000) / 10
      }
    }

    return {
      goalId,
      goalLabel: goalLabels[goalId] ?? goalId,
      totalValue: data.totalValue,
      buckets: data.buckets,
      bucketPercents,
    }
  })
}

// ── Compute bucket percentages with rounding fix ──────────

export function computeBucketPercents(
  buckets: Record<AssetBucket, number>,
  total: number,
): Record<AssetBucket, number> {
  const percents = emptyBuckets()
  if (total <= 0) return percents

  let sum = 0
  let largestBucket: AssetBucket = "large_cap"
  let largestValue = 0

  for (const b of ASSET_BUCKETS) {
    const pct = Math.round((buckets[b] / total) * 1000) / 10
    percents[b] = pct
    sum += pct
    if (buckets[b] > largestValue) {
      largestValue = buckets[b]
      largestBucket = b
    }
  }

  // Adjust largest bucket so percentages sum to 100
  const diff = Math.round((100 - sum) * 10) / 10
  if (diff !== 0) {
    percents[largestBucket] = Math.round((percents[largestBucket] + diff) * 10) / 10
  }

  return percents
}
