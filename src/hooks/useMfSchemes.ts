import { useState, useEffect } from "react"
import { fetchSchemeList, fetchLatestNav } from "@/services/mf-api"
import type { MFScheme } from "@/services/mf-api"

/**
 * Call this early (e.g. on the step before lumpsum/SIP) to warm the cache.
 * It's safe to call multiple times — fetchSchemeList uses localStorage cache.
 */
export function prefetchSchemeList(): void {
  fetchSchemeList().catch(() => { /* silent */ })
}

interface UseMfSchemesReturn {
  allSchemes: MFScheme[]
  loading: boolean
  error: string | null
  fetchNav: (schemeCode: string) => Promise<number>
}

export function useMfSchemes(): UseMfSchemesReturn {
  const [allSchemes, setAllSchemes] = useState<MFScheme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const schemes = await fetchSchemeList()
        if (!cancelled) setAllSchemes(schemes)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load scheme list")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { allSchemes, loading, error, fetchNav: fetchLatestNav }
}
