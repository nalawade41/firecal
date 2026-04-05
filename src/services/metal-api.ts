/**
 * Gold & Silver Price API Service
 * Fetches current prices per gram in INR from gold-api.com
 * Caches results in localStorage with daily expiry
 */

const GOLD_CACHE_KEY = "metal_gold_inr"
const SILVER_CACHE_KEY = "metal_silver_inr"

interface CachedPrice {
  pricePerGram: number
  date: string // YYYY-MM-DD
}

export interface MetalPrices {
  goldPerGram: number
  silverPerGram: number
}

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0]
}

function isCacheValid(cacheDate: string): boolean {
  return cacheDate === getCurrentDate()
}

function readCache(key: string): number | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed: CachedPrice = JSON.parse(raw)
    return isCacheValid(parsed.date) ? parsed.pricePerGram : null
  } catch {
    return null
  }
}

function writeCache(key: string, pricePerGram: number): void {
  const data: CachedPrice = { pricePerGram, date: getCurrentDate() }
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Fetch price per gram for a metal.
 * API returns price per troy ounce; 1 troy oz = 31.1035 grams.
 */
async function fetchPricePerGram(url: string, cacheKey: string): Promise<number> {
  const cached = readCache(cacheKey)
  if (cached !== null) return cached

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Metal price fetch failed: ${response.status}`)
  }

  const data = await response.json()
  const pricePerOunce = data?.price
  if (typeof pricePerOunce !== "number" || pricePerOunce <= 0) {
    throw new Error("Invalid metal price response")
  }

  const pricePerGram = pricePerOunce / 31.1035
  writeCache(cacheKey, pricePerGram)
  return pricePerGram
}

/**
 * Fetch gold price per gram in INR
 */
export async function fetchGoldPrice(): Promise<number> {
  return fetchPricePerGram("https://api.gold-api.com/price/XAU/INR", GOLD_CACHE_KEY)
}

/**
 * Fetch silver price per gram in INR
 */
export async function fetchSilverPrice(): Promise<number> {
  return fetchPricePerGram("https://api.gold-api.com/price/XAG/INR", SILVER_CACHE_KEY)
}

/**
 * Fetch both gold and silver prices. Returns partial results on individual failures.
 */
export async function fetchMetalPrices(): Promise<MetalPrices> {
  const [gold, silver] = await Promise.all([
    fetchGoldPrice().catch(() => 0),
    fetchSilverPrice().catch(() => 0),
  ])
  return { goldPerGram: gold, silverPerGram: silver }
}

/**
 * Fire-and-forget prefetch for both metal prices
 */
export function prefetchMetalPrices(): void {
  fetchMetalPrices().catch(() => { /* silent */ })
}
