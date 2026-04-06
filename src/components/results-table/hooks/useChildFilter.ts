import { useState } from "react"
import type { UseChildFilterReturn } from "../types/ResultsTable.types"

export function useChildFilter(): UseChildFilterReturn {
  const [childFilter, setChildFilter] = useState(-1)
  return { childFilter, setChildFilter }
}
