import type { SummaryResult, GoalBucket, GoalCategorySummary } from "@/types"

export interface FireSummaryProps {
  summary: SummaryResult
}

export interface SurvivalBannerProps {
  survived: boolean
  finalBalance: number
  depletionAge?: number | null
  depletionYear?: number | null
}

export interface CorpusBreakdownProps {
  retirementLivingCorpus: number
  totalGoalCorpus: number
  totalRequiredCorpus: number
}

export interface PortfolioGapProps {
  portfolioAtRetirement: number
  corpusGap: number
  livingCorpusGap: number
  goalCorpusGap: number
  totalGoalLumpsumToday: number
  totalMonthlySipRequired: number
  totalAnnualSipRequired: number
}

export interface GoalPlanningSectionProps {
  totalGoalLumpsumToday: number
  totalGoalCorpus: number
  longestGoalHorizonYears: number
  goalCategories: GoalCategorySummary[]
  goalMonthlySipTotal: number
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
