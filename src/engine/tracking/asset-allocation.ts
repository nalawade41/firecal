/**
 * Asset Allocation Engine — Main Orchestrator
 * Computes real portfolio allocation from user holdings via look-through
 * classification of MF portfolios, with SEBI category fallback.
 */
import type { OnboardingData, LumpsumEntry, SipEntry } from "@/types/onboarding"
import type {
  AssetBucket,
  AmfiClassificationEntry,
  ClassifiedHolding,
  FundAllocationResult,
  MFDataFundHoldings,
  PortfolioAllocationResult,
} from "@/types/asset-allocation"
import { emptyBuckets, ASSET_BUCKETS } from "@/types/asset-allocation"
import { readCache, MF_NAV_PREFIX, METAL_GOLD_KEY, METAL_SILVER_KEY, CACHE_TTL_24H } from "@/store"
import { fetchAllHoldings } from "@/services/mfdata-api"
import {
  buildClassificationIndex,
  buildAliasMap,
  classifyHolding,
  normalizeStockName,
} from "./holdings-classifier"
import {
  aggregateFundBuckets,
  detectOverlaps,
  extractTopHoldings,
  groupByGoal,
  computeBucketPercents,
} from "./holdings-aggregator"
import _amfiData from "@/engine/data/amfi-classification.json"

const amfiData = _amfiData as AmfiClassificationEntry[]

// ── SEBI category fallback map ────────────────────────────

const CATEGORY_BUCKET_MAP: Record<string, Partial<Record<AssetBucket, number>>> = {
  "Large Cap":               { large_cap: 100 },
  "Large-Cap":               { large_cap: 100 },
  "Large & Mid Cap":         { large_cap: 50, mid_cap: 50 },
  "Mid Cap":                 { mid_cap: 100 },
  "Mid-Cap":                 { mid_cap: 100 },
  "Small Cap":               { small_cap: 100 },
  "Small-Cap":               { small_cap: 100 },
  "Multi Cap":               { large_cap: 40, mid_cap: 30, small_cap: 30 },
  "Flexi Cap":               { large_cap: 55, mid_cap: 25, small_cap: 20 },
  "ELSS":                    { large_cap: 50, mid_cap: 30, small_cap: 20 },
  "Value":                   { large_cap: 50, mid_cap: 30, small_cap: 20 },
  "Contra":                  { large_cap: 50, mid_cap: 30, small_cap: 20 },
  "Focused":                 { large_cap: 60, mid_cap: 25, small_cap: 15 },
  "Dividend Yield":          { large_cap: 60, mid_cap: 25, small_cap: 15 },
  "Sectoral":                { large_cap: 50, mid_cap: 30, small_cap: 20 },
  "Thematic":                { large_cap: 50, mid_cap: 30, small_cap: 20 },
  "Index":                   { large_cap: 100 },
  "Liquid":                  { debt: 100 },
  "Ultra Short Duration":    { debt: 100 },
  "Low Duration":            { debt: 100 },
  "Short Duration":          { debt: 100 },
  "Medium Duration":         { debt: 100 },
  "Medium to Long Duration": { debt: 100 },
  "Long Duration":           { debt: 100 },
  "Corporate Bond":          { debt: 100 },
  "Gilt":                    { debt: 100 },
  "Gilt with 10 year constant duration": { debt: 100 },
  "Banking & PSU":           { debt: 100 },
  "Dynamic Bond":            { debt: 100 },
  "Credit Risk":             { debt: 100 },
  "Floater":                 { debt: 100 },
  "Overnight":               { debt: 100 },
  "Money Market":            { debt: 100 },
  "Aggressive Hybrid":       { large_cap: 45, mid_cap: 15, small_cap: 5, debt: 35 },
  "Conservative Hybrid":     { large_cap: 15, mid_cap: 5, debt: 80 },
  "Balanced Advantage":      { large_cap: 35, mid_cap: 10, small_cap: 5, debt: 50 },
  "Equity Savings":          { large_cap: 20, mid_cap: 5, debt: 75 },
  "Multi Asset Allocation":  { large_cap: 30, mid_cap: 10, debt: 40, gold: 20 },
  "International":           { international: 100 },
  "Fund of Funds - Overseas": { international: 100 },
}

// ── Helpers ───────────────────────────────────────────────

function getCachedNav(schemeCode: string): number | null {
  return readCache<number>(`${MF_NAV_PREFIX}${schemeCode}`, CACHE_TTL_24H)
}

function getCachedMetalPrice(key: string): number | null {
  return readCache<number>(key, CACHE_TTL_24H)
}

interface FundUnit {
  schemeCode: string
  fundName: string
  goalId: string
  totalUnits: number
}

function collectFundUnits(
  lumpsums: LumpsumEntry[],
  sips: SipEntry[],
): FundUnit[] {
  // Group by schemeCode + goalId (same fund can serve different goals)
  const key = (sc: string, gid: string) => `${sc}::${gid}`
  const map = new Map<string, FundUnit>()

  for (const l of lumpsums) {
    if (!l.schemeCode || l.units <= 0) continue
    const k = key(l.schemeCode, l.goalId)
    const existing = map.get(k)
    if (existing) {
      existing.totalUnits += l.units
    } else {
      map.set(k, {
        schemeCode: l.schemeCode,
        fundName: l.fundName,
        goalId: l.goalId,
        totalUnits: l.units,
      })
    }
  }

  for (const s of sips) {
    if (!s.schemeCode || s.unitsTillNow <= 0) continue
    const k = key(s.schemeCode, s.goalId)
    const existing = map.get(k)
    if (existing) {
      existing.totalUnits += s.unitsTillNow
    } else {
      map.set(k, {
        schemeCode: s.schemeCode,
        fundName: s.fundName,
        goalId: s.goalId,
        totalUnits: s.unitsTillNow,
      })
    }
  }

  return [...map.values()]
}

function applyFallback(
  category: string,
  userValue: number,
): Record<AssetBucket, number> {
  const buckets = emptyBuckets()
  const mapping = CATEGORY_BUCKET_MAP[category]

  if (!mapping) {
    // Unknown category → conservative: 100% debt
    buckets.debt = userValue
    return buckets
  }

  for (const [bucket, pct] of Object.entries(mapping)) {
    buckets[bucket as AssetBucket] = (pct / 100) * userValue
  }
  return buckets
}

function buildGoalLabels(data: OnboardingData): Record<string, string> {
  const labels: Record<string, string> = {}

  for (const goal of data.selectedGoals) {
    labels[goal] = goal
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  for (const custom of data.customGoalDefinitions ?? []) {
    labels[`custom::${custom.id}`] = custom.name
  }

  return labels
}

// ── Main orchestrator ─────────────────────────────────────

export async function computePortfolioAllocation(
  data: OnboardingData,
  options?: { topN?: number },
): Promise<PortfolioAllocationResult> {
  const topN = options?.topN ?? 10
  const classIndex = buildClassificationIndex(amfiData)
  const aliasMap = buildAliasMap()
  const goalLabels = buildGoalLabels(data)

  // 1. Collect fund units with user values
  const fundUnits = collectFundUnits(data.lumpsumInvestments, data.sipInvestments)
  const fundValues: (FundUnit & { userValue: number })[] = []

  for (const fu of fundUnits) {
    const nav = getCachedNav(fu.schemeCode)
    if (nav === null) continue
    fundValues.push({ ...fu, userValue: fu.totalUnits * nav })
  }

  // 2. Fetch holdings for all unique scheme codes
  const uniqueCodes = [...new Set(fundValues.map(f => f.schemeCode))]
  const holdingsData = await fetchAllHoldings(uniqueCodes)

  // 3. Classify each fund
  const funds: FundAllocationResult[] = []
  let lookThroughCount = 0
  let fallbackCount = 0
  let failedCount = 0

  for (const fv of fundValues) {
    const data = holdingsData.get(fv.schemeCode)

    if (data) {
      const { holdings, schemeInfo } = data
      const classified = classifyFundHoldings(
        holdings,
        fv.userValue,
        classIndex,
        aliasMap,
      )

      if (classified.length > 0) {
        const buckets = aggregateFundBuckets(
          classified,
          holdings.debt_pct,
          holdings.other_pct,
          fv.userValue,
          holdings.other_holdings,
        )
        funds.push({
          schemeCode: fv.schemeCode,
          fundName: fv.fundName,
          goalId: fv.goalId,
          userValue: fv.userValue,
          source: "look_through",
          buckets,
          holdings: classified,
          familyId: schemeInfo.family_id,
        })
        lookThroughCount++
        continue
      }

      // Holdings exist but no equity → use category fallback
      funds.push({
        schemeCode: fv.schemeCode,
        fundName: fv.fundName,
        goalId: fv.goalId,
        userValue: fv.userValue,
        source: "category_fallback",
        buckets: applyFallback(schemeInfo.category, fv.userValue),
        holdings: [],
        familyId: schemeInfo.family_id,
      })
      fallbackCount++
    } else {
      // No data at all → debt fallback
      funds.push({
        schemeCode: fv.schemeCode,
        fundName: fv.fundName,
        goalId: fv.goalId,
        userValue: fv.userValue,
        source: "failed",
        buckets: applyFallback("", fv.userValue),
        holdings: [],
        familyId: null,
      })
      failedCount++
    }
  }

  // 4. Add non-MF assets
  const otherAssets = data.otherAssets
  const totalBuckets = emptyBuckets()

  // Sum all fund buckets
  for (const fund of funds) {
    for (const b of ASSET_BUCKETS) {
      totalBuckets[b] += fund.buckets[b]
    }
  }

  // EPF + NPS + emergency + savings → debt
  totalBuckets.debt +=
    (otherAssets.epf?.currentBalance ?? 0) +
    (otherAssets.nps?.currentBalance ?? 0) +
    (otherAssets.emergencyFund ?? 0) +
    (otherAssets.otherSavings ?? 0)

  // Gold & silver
  const goldPrice = getCachedMetalPrice(METAL_GOLD_KEY)
  const silverPrice = getCachedMetalPrice(METAL_SILVER_KEY)
  totalBuckets.gold += (otherAssets.goldGrams ?? 0) * (goldPrice ?? 0)
  totalBuckets.silver += (otherAssets.silverGrams ?? 0) * (silverPrice ?? 0)

  // 5. Compute totals and percentages
  const totalPortfolioValue = ASSET_BUCKETS.reduce((sum, b) => sum + totalBuckets[b], 0)
  const bucketPercents = computeBucketPercents(totalBuckets, totalPortfolioValue)
  const equityPercent =
    bucketPercents.large_cap +
    bucketPercents.mid_cap +
    bucketPercents.small_cap +
    bucketPercents.international

  // 6. Analytics
  const topHoldings = extractTopHoldings(funds, topN)
  const overlaps = detectOverlaps(funds)
  const goals = groupByGoal(funds, goalLabels)

  return {
    totalPortfolioValue,
    buckets: totalBuckets,
    bucketPercents,
    equityPercent: Math.round(equityPercent * 10) / 10,
    funds,
    goals,
    topHoldings,
    overlaps,
    calculatedAt: new Date().toISOString(),
    fundsWithLookThrough: lookThroughCount,
    fundsWithFallback: fallbackCount,
    fundsFailed: failedCount,
  }
}

// ── Classify all equity holdings in a fund ────────────────

function classifyFundHoldings(
  holdings: MFDataFundHoldings,
  userValue: number,
  classIndex: ReturnType<typeof buildClassificationIndex>,
  aliasMap: Map<string, string>,
): ClassifiedHolding[] {
  if (!holdings.equity_holdings || holdings.equity_holdings.length === 0) {
    return []
  }

  const totalEquityWeight = holdings.equity_holdings.reduce(
    (sum, h) => sum + h.weight_pct, 0,
  )
  if (totalEquityWeight <= 0) return []

  const equityShare = (holdings.equity_pct / 100) * userValue

  return holdings.equity_holdings.map(h => {
    const { bucket, matchMethod } = classifyHolding(h, classIndex, aliasMap)
    const fraction = h.weight_pct / totalEquityWeight

    return {
      stockName: h.stock_name,
      isin: h.isin,
      normalizedName: normalizeStockName(h.stock_name),
      weightPct: h.weight_pct,
      userValue: fraction * equityShare,
      bucket,
      matchMethod,
    }
  })
}
