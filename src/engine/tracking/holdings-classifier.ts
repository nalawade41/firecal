/**
 * Stock classification engine.
 * Classifies individual equity holdings into asset buckets
 * using AMFI data, ISIN matching, name normalization, and aliases.
 */
import type {
  AssetBucket,
  CapCategory,
  AmfiClassificationEntry,
  MFDataEquityHolding,
  MatchMethod,
} from "@/types/asset-allocation"
import { INTERNATIONAL_STOCK_NAMES } from "@/engine/data/international-stocks"
import { STOCK_ALIAS_MAP } from "@/engine/data/stock-aliases"

// ── Classification index ──────────────────────────────────

export interface ClassificationIndex {
  byIsin: Map<string, CapCategory>
  byName: Map<string, CapCategory>
}

export function buildClassificationIndex(
  amfiList: AmfiClassificationEntry[],
): ClassificationIndex {
  const byIsin = new Map<string, CapCategory>()
  const byName = new Map<string, CapCategory>()

  for (const entry of amfiList) {
    byIsin.set(entry.isin, entry.cap_category)
    byName.set(normalizeStockName(entry.company_name), entry.cap_category)
  }

  return { byIsin, byName }
}

// ── Name normalization ────────────────────────────────────

export function normalizeStockName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(ltd|limited|inc|incorporated|corporation|corp|co)\b\.?/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// ── International stock detection ─────────────────────────

export function isInternationalStock(
  stockName: string,
  isin: string | null,
): boolean {
  if (isin && !isin.startsWith("INE") && !isin.startsWith("IN")) {
    return true
  }
  const normalized = normalizeStockName(stockName)
  return INTERNATIONAL_STOCK_NAMES.has(normalized)
}

// ── Build alias lookup ────────────────────────────────────

export function buildAliasMap(): Map<string, string> {
  return new Map(Object.entries(STOCK_ALIAS_MAP))
}

// ── Classify a single equity holding ──────────────────────

export function classifyHolding(
  holding: MFDataEquityHolding,
  index: ClassificationIndex,
  aliasMap: Map<string, string>,
): { bucket: AssetBucket; matchMethod: MatchMethod } {
  const { stock_name, isin } = holding

  // 1. ISIN prefix check for international
  if (isin && !isin.startsWith("INE") && !isin.startsWith("IN")) {
    return { bucket: "international", matchMethod: "isin" }
  }

  // 2. ISIN lookup in AMFI index
  if (isin) {
    const cap = index.byIsin.get(isin)
    if (cap) return { bucket: cap, matchMethod: "isin" }
  }

  const normalized = normalizeStockName(stock_name)

  // 3. Normalized name lookup in AMFI index
  const capByName = index.byName.get(normalized)
  if (capByName) return { bucket: capByName, matchMethod: "name" }

  // 4. Alias map lookup
  const aliasIsin = aliasMap.get(normalized)
  if (aliasIsin) {
    const cap = index.byIsin.get(aliasIsin)
    if (cap) return { bucket: cap, matchMethod: "alias" }
  }

  // 5. International whitelist check
  if (INTERNATIONAL_STOCK_NAMES.has(normalized)) {
    return { bucket: "international", matchMethod: "name" }
  }

  // 6. Default: small_cap (not in large/mid AMFI list → small cap)
  return { bucket: "small_cap", matchMethod: "category_fallback" }
}
