import type {
  WhitegoodsItem,
  TimelineYear,
  WhitegoodsYearResult,
  YearlyWhitegoodsResult,
} from "@/types"

export function computeWhitegoodsForYear(
  timeline: TimelineYear,
  items: WhitegoodsItem[]
): YearlyWhitegoodsResult {
  const { yearIndex } = timeline

  const perItem: WhitegoodsYearResult[] = items.map((item) => {
    const isReplacement =
      yearIndex > 0 && yearIndex % item.replacementFrequencyYears === 0

    if (!isReplacement) {
      return { itemName: item.itemName, cost: 0 }
    }

    const cost =
      item.currentCost * Math.pow(1 + item.inflationPercent / 100, yearIndex)

    return { itemName: item.itemName, cost }
  })

  const totalWhitegoodsCost = perItem.reduce((sum, i) => sum + i.cost, 0)

  return { perItem, totalWhitegoodsCost }
}
