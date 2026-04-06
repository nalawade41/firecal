import { useState } from "react"
import type { UseCategoryTabContentReturn } from "../types/ResultsTable.types"

export function useCategoryTabContent(): UseCategoryTabContentReturn {
  const [view, setView] = useState<"expenses" | "portfolio">("expenses")
  return { view, setView }
}
