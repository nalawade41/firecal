import type { GoalCategorySummary } from "@/types"

export function rowBg(isRetired: boolean): string {
  return isRetired ? "bg-amber-50/30" : "bg-white/20"
}

export function bucketLabelsForCategory(
  goalCategories: GoalCategorySummary[] | undefined,
  category: string
): string[] {
  if (!goalCategories) return []
  const cat = goalCategories.find((c) => c.category === category)
  return cat ? cat.buckets.map((b) => b.label) : []
}
