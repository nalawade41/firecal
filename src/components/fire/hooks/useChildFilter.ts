import { useState } from "react"
import type { UseChildFilterReturn } from "../types/FireTable.types"

export function useChildFilter(): UseChildFilterReturn {
  const [childFilter, setChildFilter] = useState(-1)
  return { childFilter, setChildFilter }
}
