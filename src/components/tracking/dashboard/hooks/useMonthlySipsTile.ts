import { useState } from "react"
import type { MonthlySipsView } from "@/types/dashboard"
import type { SipFilterType, UseMonthlySipsTileReturn } from "../types/Dashboard.components.types"

export function useMonthlySipsTile(sips: MonthlySipsView): UseMonthlySipsTileReturn {
  const [filter, setFilter] = useState<SipFilterType>("active")

  const displayItems = filter === "active" ? sips.items : sips.closedItems || []
  const displayCount = filter === "active" ? sips.sipCount : sips.closedCount || 0
  const displayTotal = filter === "active" ? sips.totalAmount : sips.closedTotalAmount || "₹0"

  return {
    filter,
    setFilter,
    displayItems,
    displayCount,
    displayTotal,
  }
}
