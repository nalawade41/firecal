import { useState } from "react"
import type { UseFireCorpusTileReturn } from "../types/Dashboard.components.types"

export function useFireCorpusTile(): UseFireCorpusTileReturn {
  const [showTooltip, setShowTooltip] = useState(false)

  return {
    showTooltip,
    onTooltipEnter: () => setShowTooltip(true),
    onTooltipLeave: () => setShowTooltip(false),
  }
}
