import type { SummaryResult, GoalBucket, GoalCategorySummary } from "@/types"

export interface ResultsSummaryProps {
  summary: SummaryResult
}

export interface RowProps {
  label: string
  value: string
  bold?: boolean
}

export interface BucketCardProps {
  bucket: GoalBucket
}

export interface CategorySectionProps {
  cat: GoalCategorySummary
  icon: React.ReactNode
}

export interface UseCategorySectionReturn {
  expanded: boolean
  toggle: () => void
}
