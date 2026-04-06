import type { YearResult, GoalCategorySummary } from "@/types"

export interface ResultsTableProps {
  yearByYear: YearResult[]
  goalCategories?: GoalCategorySummary[]
}

export interface TabDataProps {
  yearByYear: YearResult[]
}

export interface ChildFilterProps {
  childCount: number
  selected: number
  onSelect: (idx: number) => void
}

export interface ViewToggleProps {
  view: "expenses" | "portfolio"
  onToggle: (v: "expenses" | "portfolio") => void
}

export interface CategoryTabContentProps {
  yearByYear: YearResult[]
  bucketLabels: string[]
  children: React.ReactNode
}

export interface MultiBucketPortfolioViewProps {
  yearByYear: YearResult[]
  bucketLabels: string[]
}

export interface BucketPortfolioTableProps {
  yearByYear: YearResult[]
  bucketLabel: string
}

export interface UseChildFilterReturn {
  childFilter: number
  setChildFilter: (idx: number) => void
}

export interface UseCategoryTabContentReturn {
  view: "expenses" | "portfolio"
  setView: (v: "expenses" | "portfolio") => void
}

export interface UseMultiBucketReturn {
  selected: number
  setSelected: (idx: number) => void
}
