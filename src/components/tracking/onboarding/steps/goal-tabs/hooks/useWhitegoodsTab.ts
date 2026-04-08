import { useMemo } from "react"
import type { WhitegoodsItem } from "@/types/onboarding"
import { computeLumpsumNeeded, computeSipNeeded } from "@/engine"
import type { TabProps, UseWhitegoodsTabReturn, WhitegoodsItemViewData } from "../types/GoalTabs.types"

export function useWhitegoodsTab({ data, updateGoalDetails }: TabProps): UseWhitegoodsTabReturn {
  const items: WhitegoodsItem[] = useMemo(() =>
    data.goalDetails.whitegoods ??
      [{ itemName: "", currentCost: 0, inflationExpected: 6, replacementFrequencyYears: 5, expectedReturns: 10 }],
    [data.goalDetails.whitegoods])

  const itemViews: WhitegoodsItemViewData[] = useMemo(() =>
    items.map((item, idx) => {
      const expRet = item.expectedReturns ?? 10
      const horizon = item.replacementFrequencyYears
      const inflatedCost = Math.round(item.currentCost * Math.pow(1 + item.inflationExpected / 100, horizon))
      const lumpsum = horizon > 0 ? computeLumpsumNeeded(inflatedCost, expRet / 100, horizon) : inflatedCost
      const sip = horizon > 0 ? computeSipNeeded(inflatedCost, expRet / 100, horizon) : 0
      return { item, index: idx, expRet, horizon, inflatedCost, lumpsum, sip }
    }), [items])

  function updateItem(index: number, patch: Partial<WhitegoodsItem>) {
    const updated = [...items]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ whitegoods: updated })
  }

  function addItem() {
    updateGoalDetails({
      whitegoods: [...items, { itemName: "", currentCost: 0, inflationExpected: 6, replacementFrequencyYears: 5, expectedReturns: 10 }],
    })
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    updateGoalDetails({ whitegoods: items.filter((_, i) => i !== index) })
  }

  return { itemViews, updateItem, addItem, removeItem, canRemove: items.length > 1 }
}
