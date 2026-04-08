/**
 * Net Worth Calculation Engine
 * Computes total net worth and breakdown from onboarding data using cached NAVs and metal prices.
 */

import type { OnboardingData, LumpsumEntry, SipEntry, OtherAssets } from "@/types/onboarding"
import { fetchLatestNav } from "@/services/mf-api"
import { fetchMetalPrices } from "@/services/metal-api"
import { readCache, MF_NAV_PREFIX, METAL_GOLD_KEY, METAL_SILVER_KEY, CACHE_TTL_24H } from "@/store"

export interface NetWorthResult {
  total: number
  mfPortfolio: number
  epfNps: number
  preciousMetals: number
  liquid: number
}

export interface NetWorthCalculation extends NetWorthResult {
  missingNavCount: number
  missingNavFunds: string[]
  missingMetalPrices: string[]
  calculatedAt: string
}

function getCachedNav(schemeCode: string): number | null {
  return readCache<number>(`${MF_NAV_PREFIX}${schemeCode}`, CACHE_TTL_24H)
}

function getCachedMetalPrice(key: string): number | null {
  return readCache<number>(key, CACHE_TTL_24H)
}

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

function calculatePreciousMetalsValue(assets: OtherAssets): {
  gold: number
  silver: number
  total: number
  missing: string[]
} {
  const goldPrice = getCachedMetalPrice(METAL_GOLD_KEY)
  const silverPrice = getCachedMetalPrice(METAL_SILVER_KEY)
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

export async function refreshNetWorthData(
  data: OnboardingData,
): Promise<{ calculation: NetWorthCalculation; errors: string[] }> {
  const errors: string[] = []

  const schemeCodes = new Set<string>()
  for (const entry of data.lumpsumInvestments) {
    if (entry.schemeCode) schemeCodes.add(entry.schemeCode)
  }
  for (const entry of data.sipInvestments) {
    if (entry.schemeCode) schemeCodes.add(entry.schemeCode)
  }

  await Promise.all(
    Array.from(schemeCodes).map(async (code) => {
      try {
        await fetchLatestNav(code)
      } catch {
        errors.push(`Failed to refresh NAV for ${code}`)
      }
    }),
  )

  try {
    await fetchMetalPrices()
  } catch {
    errors.push("Failed to refresh metal prices")
  }

  const calculation = calculateNetWorth(data)
  return { calculation, errors }
}
