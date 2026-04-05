/**
 * Net Worth Calculation Engine
 * Computes total net worth and breakdown from onboarding data using cached NAVs and metal prices.
 */

import type { OnboardingData, LumpsumEntry, SipEntry, OtherAssets } from "@/types/onboarding"
import { fetchLatestNav } from "@/services/mf-api"
import { fetchMetalPrices } from "@/services/metal-api"

export interface NetWorthResult {
  total: number
  mfPortfolio: number
  epfNps: number
  preciousMetals: number // Gold + Silver
  liquid: number // Emergency + Savings
}

export interface NetWorthCalculation extends NetWorthResult {
  missingNavCount: number
  missingNavFunds: string[]
  missingMetalPrices: string[]
  calculatedAt: string // ISO timestamp
}

/**
 * Read cached NAV from localStorage (same key format as mf-api.ts)
 */
function getCachedNav(schemeCode: string): number | null {
  const cacheKey = `mf_nav_${schemeCode}`
  const raw = localStorage.getItem(cacheKey)
  if (!raw) return null
  try {
    const parsed: { data: number; date: string } = JSON.parse(raw)
    const today = new Date().toISOString().split("T")[0]
    return parsed.date === today ? parsed.data : null
  } catch {
    return null
  }
}

/**
 * Read cached metal price from localStorage (same key format as metal-api.ts)
 */
function getCachedMetalPrice(key: "metal_gold_inr" | "metal_silver_inr"): number | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed: { pricePerGram: number; date: string } = JSON.parse(raw)
    const today = new Date().toISOString().split("T")[0]
    return parsed.date === today ? parsed.pricePerGram : null
  } catch {
    return null
  }
}

/**
 * Calculate MF portfolio value from lumpsum and SIP entries using cached NAVs.
 * Missing NAVs are treated as 0 (will not contribute to total).
 */
function calculateMFValue(
  lumpsum: LumpsumEntry[],
  sip: SipEntry[],
): { total: number; withMissingNav: string[] } {
  let total = 0
  const missingNav: string[] = []

  for (const entry of lumpsum) {
    if (!entry.schemeCode || entry.units <= 0) continue
    const nav = getCachedNav(entry.schemeCode)
    if (nav === null) {
      missingNav.push(entry.fundName || entry.schemeCode)
      continue
    }
    total += entry.units * nav
  }

  for (const entry of sip) {
    if (!entry.schemeCode || entry.unitsTillNow <= 0) continue
    const nav = getCachedNav(entry.schemeCode)
    if (nav === null) {
      missingNav.push(entry.fundName || entry.schemeCode)
      continue
    }
    total += entry.unitsTillNow * nav
  }

  return { total, withMissingNav: missingNav }
}

/**
 * Calculate gold and silver value from grams using cached prices.
 */
function calculatePreciousMetalsValue(assets: OtherAssets): {
  gold: number
  silver: number
  total: number
  missing: string[]
} {
  const goldPrice = getCachedMetalPrice("metal_gold_inr")
  const silverPrice = getCachedMetalPrice("metal_silver_inr")
  const missing: string[] = []

  let gold = 0
  let silver = 0

  if (assets.goldGrams > 0) {
    if (goldPrice === null) {
      missing.push("Gold price not cached")
    } else {
      gold = assets.goldGrams * goldPrice
    }
  }

  if (assets.silverGrams > 0) {
    if (silverPrice === null) {
      missing.push("Silver price not cached")
    } else {
      silver = assets.silverGrams * silverPrice
    }
  }

  return { gold, silver, total: gold + silver, missing }
}

/**
 * Calculate total net worth from onboarding data.
 * Uses cached NAVs and metal prices; missing data is treated as 0.
 */
export function calculateNetWorth(data: OnboardingData): NetWorthCalculation {
  const mf = calculateMFValue(data.lumpsumInvestments, data.sipInvestments)
  const metals = calculatePreciousMetalsValue(data.otherAssets)

  const epfNps = data.otherAssets.epf.currentBalance + data.otherAssets.nps.currentBalance
  const liquid = data.otherAssets.emergencyFund + data.otherAssets.otherSavings

  const total = mf.total + epfNps + metals.total + liquid

  return {
    total,
    mfPortfolio: mf.total,
    epfNps,
    preciousMetals: metals.total,
    liquid,
    missingNavCount: mf.withMissingNav.length,
    missingNavFunds: mf.withMissingNav,
    missingMetalPrices: metals.missing,
    calculatedAt: new Date().toISOString(),
  }
}

/**
 * Refresh all NAVs and metal prices, then recalculate.
 * Returns updated calculation and any errors encountered.
 */
export async function refreshNetWorthData(
  data: OnboardingData,
): Promise<{ calculation: NetWorthCalculation; errors: string[] }> {
  const errors: string[] = []

  // Collect unique scheme codes from lumpsum and SIP
  const schemeCodes = new Set<string>()
  for (const entry of data.lumpsumInvestments) {
    if (entry.schemeCode) schemeCodes.add(entry.schemeCode)
  }
  for (const entry of data.sipInvestments) {
    if (entry.schemeCode) schemeCodes.add(entry.schemeCode)
  }

  // Re-fetch NAVs for all schemes in parallel
  await Promise.all(
    Array.from(schemeCodes).map(async (code) => {
      try {
        await fetchLatestNav(code)
      } catch {
        errors.push(`Failed to refresh NAV for ${code}`)
      }
    }),
  )

  // Re-fetch metal prices
  try {
    await fetchMetalPrices()
  } catch {
    errors.push("Failed to refresh metal prices")
  }

  // Recalculate with fresh data
  const calculation = calculateNetWorth(data)
  return { calculation, errors }
}
