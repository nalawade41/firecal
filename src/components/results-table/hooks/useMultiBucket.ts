import { useState } from "react"
import type { UseMultiBucketReturn } from "../types/ResultsTable.types"

export function useMultiBucket(): UseMultiBucketReturn {
  const [selected, setSelected] = useState(0)
  return { selected, setSelected }
}
