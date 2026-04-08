/**
 * Storage abstraction layer.
 *
 * All app code reads/writes through this interface instead of calling
 * localStorage directly. To swap the backend (sessionStorage, IndexedDB,
 * remote API), replace the adapter — zero consumer changes needed.
 */

import { localStorageAdapter } from "./local-storage/adapter"

// ── Adapter interface ──────────────────────────────────────
export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
  keys(): string[]
}

let adapter: StorageAdapter = localStorageAdapter

/**
 * Replace the storage backend. Call once at app init if needed.
 * Example: `setStorageAdapter(sessionStorageAdapter)`
 */
export function setStorageAdapter(a: StorageAdapter): void {
  adapter = a
}

// ── Typed helpers ──────────────────────────────────────────

export function readJSON<T>(key: string): T | null {
  try {
    const raw = adapter.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJSON<T>(key: string, value: T): void {
  adapter.set(key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  adapter.remove(key)
}

export function removeByPrefix(prefix: string): void {
  for (const key of adapter.keys()) {
    if (key.startsWith(prefix)) {
      adapter.remove(key)
    }
  }
}

// ── Cache helpers (JSON + TTL) ─────────────────────────────

interface CacheEntry<T> {
  data: T
  ts: number
}

export function readCache<T>(key: string, maxAgeMs: number): T | null {
  const entry = readJSON<CacheEntry<T>>(key)
  if (!entry) return null
  if (Date.now() - entry.ts > maxAgeMs) return null
  return entry.data
}

export function writeCache<T>(key: string, data: T): void {
  writeJSON<CacheEntry<T>>(key, { data, ts: Date.now() })
}

// ── Month-based cache (invalidates on calendar month change) ──

interface MonthCacheEntry<T> {
  data: T
  month: string
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function readMonthCache<T>(key: string): T | null {
  const entry = readJSON<MonthCacheEntry<T>>(key)
  if (!entry) return null
  if (entry.month !== currentMonth()) return null
  return entry.data
}

export function writeMonthCache<T>(key: string, data: T): void {
  writeJSON<MonthCacheEntry<T>>(key, { data, month: currentMonth() })
}
