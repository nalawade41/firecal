/**
 * Gold & Silver Price API Service
 * Fetches current prices per gram in INR from gold-api.com
 * Caches results via storage abstraction with daily expiry
 */
import { readCache, writeCache, METAL_GOLD_KEY, METAL_SILVER_KEY, CACHE_TTL_24H } from "@/store"

export interface MetalPrices {
  goldPerGram: number
  silverPerGram: number
}

/**
 * Fetch price per gram for a metal.
 * API returns price per troy ounce; 1 troy oz = 31.1035 grams.
 */
async function fetchPricePerGram(url: string, cacheKey: string): Promise<number> {
  const cached = readCache<number>(cacheKey, CACHE_TTL_24H)
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

export async function fetchGoldPrice(): Promise<number> {
  return fetchPricePerGram("https://api.gold-api.com/price/XAU/INR", METAL_GOLD_KEY)
}

export async function fetchSilverPrice(): Promise<number> {
  return fetchPricePerGram("https://api.gold-api.com/price/XAG/INR", METAL_SILVER_KEY)
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  const [gold, silver] = await Promise.all([
    fetchGoldPrice().catch(() => 0),
    fetchSilverPrice().catch(() => 0),
  ])
  return { goldPerGram: gold, silverPerGram: silver }
}

export function prefetchMetalPrices(): void {
  fetchMetalPrices().catch(() => { /* silent */ })
}
