import { useState } from "react"
import type { UseCategorySectionReturn } from "../types/ResultsSummary.types"

export function useCategorySection(): UseCategorySectionReturn {
  const [expanded, setExpanded] = useState(false)

  function toggle() {
    setExpanded((prev) => !prev)
  }

  return { expanded, toggle }
}
