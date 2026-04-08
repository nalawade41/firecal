/**
 * Mutual Fund API Service
 * Handles fetching and caching of scheme lists and NAV data from mfapi.in
 */
import { readCache, writeCache, removeKey, removeByPrefix, MF_SCHEME_LIST_KEY, MF_NAV_PREFIX, CACHE_TTL_24H } from "@/store"

export interface MFScheme {
  schemeCode: string
  schemeName: string
  fundHouse: string
}

function normalizeAmcName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/mutual\s*fund/i, "")
    .replace(/amc/i, "")
    .trim()
}

function getAmcSearchTerms(amc: string): string[] {
  const normalized = normalizeAmcName(amc)

  const amcMappings: Record<string, string[]> = {
    "sbi": ["sbi"],
    "axis": ["axis"],
    "nippon india": ["nippon india", "nippon"],
    "nippon": ["nippon india", "nippon"],
    "parag parikh": ["ppfas", "parag parikh"],
    "ppfas": ["ppfas", "parag parikh"],
    "mirae asset": ["mirae asset", "mirae"],
    "mirae": ["mirae asset", "mirae"],
  }

  return amcMappings[normalized] || [normalized]
}

function extractFundHouse(schemeName: string): string {
  const normalized = schemeName.toLowerCase()

  const amcPatterns = [
    { pattern: /^(sbi\s+)/i, name: "sbi" },
    { pattern: /^(hdfc\s+)/i, name: "hdfc" },
    { pattern: /^(icici\s+prudential\s+)/i, name: "icici prudential" },
    { pattern: /^(icici\s+)/i, name: "icici" },
    { pattern: /^(nippon\s+india\s+)/i, name: "nippon india" },
    { pattern: /^(reliance\s+)/i, name: "reliance" },
    { pattern: /^(axis\s+)/i, name: "axis" },
    { pattern: /^(kotak\s+)/i, name: "kotak" },
    { pattern: /^(uti\s+)/i, name: "uti" },
    { pattern: /^(idfc\s+)/i, name: "idfc" },
    { pattern: /^(dsp\s+)/i, name: "dsp" },
    { pattern: /^(franklin\s+templeton\s+)/i, name: "franklin templeton" },
    { pattern: /^(tata\s+)/i, name: "tata" },
    { pattern: /^(lic\s+)/i, name: "lic" },
    { pattern: /^(canara\s+robeco\s+)/i, name: "canara robeco" },
    { pattern: /^(mirae\s+asset\s+)/i, name: "mirae asset" },
    { pattern: /^(motilal\s+oswal\s+)/i, name: "motilal oswal" },
    { pattern: /^(ppfas\s+)/i, name: "ppfas" },
    { pattern: /^(quant\s+)/i, name: "quant" },
    { pattern: /^(bandhan\s+)/i, name: "bandhan" },
    { pattern: /^(edelweiss\s+)/i, name: "edelweiss" },
    { pattern: /^(invesco\s+)/i, name: "invesco" },
    { pattern: /^(jm\s+financial\s+)/i, name: "jm financial" },
    { pattern: /^(l&t\s+)/i, name: "l&t" },
    { pattern: /^(mahindra\s+manulife\s+)/i, name: "mahindra manulife" },
    { pattern: /^(pgim\s+india\s+)/i, name: "pgim india" },
    { pattern: /^(sundaram\s+)/i, name: "sundaram" },
    { pattern: /^(tata\s+asset\s+)/i, name: "tata" },
    { pattern: /^(union\s+)/i, name: "union" },
    { pattern: /^(navi\s+)/i, name: "navi" },
    { pattern: /^(esso\s+)/i, name: "esso" },
    { pattern: /^(samco\s+)/i, name: "samco" },
    { pattern: /^(trust\s+)/i, name: "trust" },
    { pattern: /^(quantum\s+)/i, name: "quantum" },
    { pattern: /^(shriram\s+)/i, name: "shriram" },
    { pattern: /^(it\s+)/i, name: "it" },
    { pattern: /^(whiteoak\s+)/i, name: "whiteoak" },
    { pattern: /^(zerodha\s+)/i, name: "zerodha" },
  ]

  for (const { pattern, name } of amcPatterns) {
    if (pattern.test(normalized)) {
      return name
    }
  }

  const firstWord = normalized.split(/\s+/)[0]
  return firstWord || "unknown"
}

export async function fetchSchemeList(): Promise<MFScheme[]> {
  const cached = readCache<MFScheme[]>(MF_SCHEME_LIST_KEY, CACHE_TTL_24H)
  if (cached) return cached

  const response = await fetch("https://api.mfapi.in/mf?limit=50000&offset=0")
  if (!response.ok) {
    throw new Error(`Failed to fetch scheme list: ${response.status}`)
  }

  const data = await response.json()

  if (!data || !Array.isArray(data)) {
    throw new Error("Invalid scheme list response")
  }

  const schemes: MFScheme[] = data.map((item: { schemeCode: string; schemeName: string }) => ({
    schemeCode: String(item.schemeCode),
    schemeName: item.schemeName || "",
    fundHouse: extractFundHouse(item.schemeName || ""),
  }))

  writeCache(MF_SCHEME_LIST_KEY, schemes)

  return schemes
}

export function filterSchemesByAmc(schemes: MFScheme[], amc: string): MFScheme[] {
  const searchTerms = getAmcSearchTerms(amc)

  return schemes.filter(scheme => {
    const schemeFundHouse = normalizeAmcName(scheme.fundHouse)
    const schemeName = normalizeAmcName(scheme.schemeName)

    return searchTerms.some(term =>
      schemeFundHouse.includes(term) || schemeName.includes(term)
    )
  })
}

export async function fetchLatestNav(schemeCode: string): Promise<number> {
  const cacheKey = `${MF_NAV_PREFIX}${schemeCode}`
  const cached = readCache<number>(cacheKey, CACHE_TTL_24H)
  if (cached !== null) return cached

  const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`)
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV: ${response.status}`)
  }

  const data = await response.json()

  if (!data?.data || !Array.isArray(data.data) || data.data.length === 0 || !data.data[0].nav) {
    throw new Error("Invalid NAV response structure")
  }

  const nav = parseFloat(data.data[0].nav)
  if (isNaN(nav)) {
    throw new Error("Invalid NAV value")
  }

  writeCache(cacheKey, nav)

  return nav
}

export function clearMfApiCache(): void {
  removeKey(MF_SCHEME_LIST_KEY)
  removeByPrefix(MF_NAV_PREFIX)
}

export async function fetchNavForDate(
  schemeCode: string,
  targetDate: string,
): Promise<{ nav: number; actualDate: string }> {
  const maxSearchDays = 30
  const startDate = new Date(targetDate)

  for (let i = 0; i < maxSearchDays; i++) {
    const searchDate = new Date(startDate)
    searchDate.setDate(startDate.getDate() + i)
    const formattedDate = searchDate.toISOString().split("T")[0]

    try {
      const response = await fetch(
        `https://api.mfapi.in/mf/${schemeCode}?startDate=${formattedDate}&endDate=${formattedDate}`,
      )

      if (!response.ok) continue

      const data = await response.json()

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const navEntry = data.data[0]
        if (navEntry.nav && navEntry.date) {
          const nav = parseFloat(navEntry.nav)
          if (!isNaN(nav)) {
            const [dd, mm, yyyy] = navEntry.date.split("-")
            const actualDate = `${yyyy}-${mm}-${dd}`
            return { nav, actualDate }
          }
        }
      }
    } catch {
      // Continue to next day
    }
  }

  throw new Error(`NAV not found for ${schemeCode} from ${targetDate} after searching ${maxSearchDays} days`)
}

export async function calculateLumpsumUnits(
  schemeCode: string,
  amount: number,
  purchaseDate: string,
): Promise<{ units: number; nav: number; actualDate: string }> {
  const { nav, actualDate } = await fetchNavForDate(schemeCode, purchaseDate)
  const units = Math.round((amount / nav) * 10000) / 10000
  return { units, nav, actualDate }
}

export function isSchemeListCached(): boolean {
  return readCache<MFScheme[]>(MF_SCHEME_LIST_KEY, CACHE_TTL_24H) !== null
}
