/**
 * mfdata.in API Service
 * Fetches fund scheme info and portfolio holdings for asset allocation.
 */
import {
  readJSON, writeJSON, readMonthCache, writeMonthCache,
  MFDATA_SCHEME_PREFIX, MFDATA_HOLDINGS_PREFIX,
} from "@/store"
import type { MFDataSchemeInfo, MFDataFundHoldings } from "@/types/asset-allocation"

const BASE_URL = "https://mfdata.in/api/v1"

// ── Scheme info (stable, no expiry) ───────────────────────

export async function fetchSchemeInfo(schemeCode: string): Promise<MFDataSchemeInfo> {
  const cacheKey = `${MFDATA_SCHEME_PREFIX}${schemeCode}`
  const cached = readJSON<MFDataSchemeInfo>(cacheKey)
  if (cached) return cached

  const response = await fetch(`${BASE_URL}/schemes/${schemeCode}`)
  if (!response.ok) {
    throw new Error(`mfdata scheme fetch failed: ${response.status}`)
  }

  const json = await response.json()
  if (json.status !== "success" || !json.data) {
    throw new Error("Invalid mfdata scheme response")
  }

  const info: MFDataSchemeInfo = {
    family_id: json.data.family_id,
    category: json.data.category || "",
    name: json.data.name || "",
  }

  writeJSON(cacheKey, info)
  return info
}

// ── Fund holdings (month-cached) ──────────────────────────

export async function fetchFundHoldings(familyId: number): Promise<MFDataFundHoldings> {
  const cacheKey = `${MFDATA_HOLDINGS_PREFIX}${familyId}`
  const cached = readMonthCache<MFDataFundHoldings>(cacheKey)
  if (cached) return cached

  const response = await fetch(`${BASE_URL}/families/${familyId}/holdings`)
  if (!response.ok) {
    throw new Error(`mfdata holdings fetch failed: ${response.status}`)
  }

  const json = await response.json()
  if (json.status !== "success" || !json.data) {
    throw new Error("Invalid mfdata holdings response")
  }

  const holdings: MFDataFundHoldings = {
    equity_pct: json.data.equity_pct ?? 0,
    debt_pct: json.data.debt_pct ?? 0,
    other_pct: json.data.other_pct ?? 0,
    equity_holdings: json.data.equity_holdings ?? [],
    debt_holdings: json.data.debt_holdings ?? [],
    other_holdings: json.data.other_holdings ?? [],
  }

  writeMonthCache(cacheKey, holdings)
  return holdings
}

// ── Convenience: schemeCode → holdings + info ─────────────

export async function fetchHoldingsForScheme(schemeCode: string): Promise<{
  holdings: MFDataFundHoldings
  schemeInfo: MFDataSchemeInfo
}> {
  const schemeInfo = await fetchSchemeInfo(schemeCode)
  const holdings = await fetchFundHoldings(schemeInfo.family_id)
  return { holdings, schemeInfo }
}

// ── Concurrency-limited batch fetch ───────────────────────

export async function fetchAllHoldings(
  schemeCodes: string[],
): Promise<Map<string, { holdings: MFDataFundHoldings; schemeInfo: MFDataSchemeInfo }>> {
  const results = new Map<string, { holdings: MFDataFundHoldings; schemeInfo: MFDataSchemeInfo }>()
  const MAX_CONCURRENT = 3

  // First pass: fetch all scheme infos to deduplicate by family_id
  const schemeInfos = new Map<string, MFDataSchemeInfo>()
  for (let i = 0; i < schemeCodes.length; i += MAX_CONCURRENT) {
    const batch = schemeCodes.slice(i, i + MAX_CONCURRENT)
    const settled = await Promise.allSettled(
      batch.map(code => fetchSchemeInfo(code).then(info => ({ code, info }))),
    )
    for (const result of settled) {
      if (result.status === "fulfilled") {
        schemeInfos.set(result.value.code, result.value.info)
      }
    }
  }

  // Deduplicate family_ids
  const familyToSchemes = new Map<number, string[]>()
  for (const [code, info] of schemeInfos) {
    const existing = familyToSchemes.get(info.family_id) ?? []
    existing.push(code)
    familyToSchemes.set(info.family_id, existing)
  }

  // Second pass: fetch holdings per unique family_id
  const familyIds = [...familyToSchemes.keys()]
  const holdingsMap = new Map<number, MFDataFundHoldings>()

  for (let i = 0; i < familyIds.length; i += MAX_CONCURRENT) {
    const batch = familyIds.slice(i, i + MAX_CONCURRENT)
    const settled = await Promise.allSettled(
      batch.map(fid => fetchFundHoldings(fid).then(h => ({ fid, holdings: h }))),
    )
    for (const result of settled) {
      if (result.status === "fulfilled") {
        holdingsMap.set(result.value.fid, result.value.holdings)
      }
    }
  }

  // Map back to scheme codes
  for (const [code, info] of schemeInfos) {
    const holdings = holdingsMap.get(info.family_id)
    if (holdings) {
      results.set(code, { holdings, schemeInfo: info })
    }
  }

  return results
}
