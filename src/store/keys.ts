/**
 * All storage keys in one place.
 * Never use a raw string key outside this file.
 */

// ── App data ───────────────────────────────────────────────
export const ONBOARDING_KEY = "firecal-onboarding"

// ── API cache ──────────────────────────────────────────────
export const MF_SCHEME_LIST_KEY = "mf_scheme_list"
export const MF_NAV_PREFIX = "mf_nav_"
export const METAL_GOLD_KEY = "metal_gold_inr"
export const METAL_SILVER_KEY = "metal_silver_inr"

// ── mfdata.in cache ───────────────────────────────────────
export const MFDATA_SCHEME_PREFIX = "mfdata_scheme_"
export const MFDATA_HOLDINGS_PREFIX = "mfdata_holdings_"
export const AMFI_CLASSIFICATION_KEY = "amfi_classification"

// ── Cache TTLs (milliseconds) ──────────────────────────────
export const CACHE_TTL_24H = 24 * 60 * 60 * 1000
export const CACHE_TTL_1H = 60 * 60 * 1000
