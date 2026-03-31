/**
 * Mutual Fund API Service
 * Handles fetching and caching of scheme lists and NAV data from mfapi.in
 */

const SCHEME_LIST_CACHE_KEY = "mf_scheme_list"
const NAV_CACHE_KEY_PREFIX = "mf_nav_"

export interface MFScheme {
  schemeCode: string
  schemeName: string
  fundHouse: string
}

interface CachedData<T> {
  data: T
  date: string // YYYY-MM-DD format
}

/**
 * Get current date string in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Check if cache date is from today
 */
function isCacheValid(cacheDate: string): boolean {
  return cacheDate === getCurrentDate()
}

/**
 * Normalize AMC name for consistent matching
 */
function normalizeAmcName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/mutual\s*fund/i, "")
    .replace(/amc/i, "")
    .trim()
}

/**
 * Map internal AMC key to API AMC names
 */
function getAmcSearchTerms(amc: string): string[] {
  const normalized = normalizeAmcName(amc)
  
  // Map of known AMC variations
  const amcMappings: Record<string, string[]> = {
    "sbi": ["sbi", "sbi mutual", "sbi mutual fund", "state bank of india"],
  }
  
  return amcMappings[normalized] || [normalized]
}

/**
 * Fetch full scheme list from API or cache
 */
export async function fetchSchemeList(): Promise<MFScheme[]> {
  // Check cache first
  const cached = localStorage.getItem(SCHEME_LIST_CACHE_KEY)
  if (cached) {
    try {
      const parsed: CachedData<MFScheme[]> = JSON.parse(cached)
      if (isCacheValid(parsed.date)) {
        return parsed.data
      }
    } catch {
      // Invalid cache, continue to fetch
    }
  }
  
  // Fetch from API
  const response = await fetch("https://api.mfapi.in/mf?limit=50000&offset=0")
  if (!response.ok) {
    throw new Error(`Failed to fetch scheme list: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data || !Array.isArray(data)) {
    throw new Error("Invalid scheme list response")
  }
  
  // Transform and extract AMC from scheme name
  const schemes: MFScheme[] = data.map((item: { schemeCode: string; schemeName: string }) => {
    const schemeName = item.schemeName || ""
    // Extract AMC from scheme name (usually first part before the hyphen or first few words)
    const fundHouse = extractFundHouse(schemeName)
    
    return {
      schemeCode: String(item.schemeCode),
      schemeName: schemeName,
      fundHouse: fundHouse,
    }
  })
  
  // Cache the result
  const cacheData: CachedData<MFScheme[]> = {
    data: schemes,
    date: getCurrentDate(),
  }
  localStorage.setItem(SCHEME_LIST_CACHE_KEY, JSON.stringify(cacheData))
  
  return schemes
}

/**
 * Extract fund house/AMC name from scheme name
 */
function extractFundHouse(schemeName: string): string {
  const normalized = schemeName.toLowerCase()
  
  // Known AMC patterns in scheme names
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
  
  // Fallback: extract first word
  const firstWord = normalized.split(/\s+/)[0]
  return firstWord || "unknown"
}

/**
 * Filter schemes by AMC
 */
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

/**
 * Fetch latest NAV for a scheme
 */
export async function fetchLatestNav(schemeCode: string): Promise<number> {
  // Check cache first
  const cacheKey = `${NAV_CACHE_KEY_PREFIX}${schemeCode}`
  const cached = localStorage.getItem(cacheKey)
  
  if (cached) {
    try {
      const parsed: CachedData<number> = JSON.parse(cached)
      if (isCacheValid(parsed.date)) {
        return parsed.data
      }
    } catch {
      // Invalid cache, continue to fetch
    }
  }
  
  // Fetch from API
  const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`)
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV: ${response.status}`)
  }
  
  const data = await response.json()
  
  // Parse NAV from response structure: data.data[0].nav
  if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0 || !data.data[0].nav) {
    throw new Error("Invalid NAV response structure")
  }
  
  const nav = parseFloat(data.data[0].nav)
  
  if (isNaN(nav)) {
    throw new Error("Invalid NAV value")
  }
  
  // Cache the result
  const cacheData: CachedData<number> = {
    data: nav,
    date: getCurrentDate(),
  }
  localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  
  return nav
}

/**
 * Clear all MF API caches
 */
export function clearMfApiCache(): void {
  // Clear scheme list cache
  localStorage.removeItem(SCHEME_LIST_CACHE_KEY)
  
  // Clear all NAV caches
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith(NAV_CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key)
    }
  }
}

/**
 * Check if scheme list is cached and valid (from today)
 */
export function isSchemeListCached(): boolean {
  const cached = localStorage.getItem(SCHEME_LIST_CACHE_KEY)
  if (!cached) return false
  
  try {
    const parsed: CachedData<MFScheme[]> = JSON.parse(cached)
    return isCacheValid(parsed.date)
  } catch {
    return false
  }
}
