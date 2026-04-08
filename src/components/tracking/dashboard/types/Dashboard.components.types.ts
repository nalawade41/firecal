import type {
  DashboardView,
  GoalCardView,
  SipRowView,
  FireCorpusView,
  AllocationSegment,
  MonthlySipsView,
} from "@/types/dashboard"

export type { AllocationSegment }

/** Re-export badge variant type for use in dashboard constants */
export type BadgeVariant = "green" | "amber" | "red" | "blue" | "gray" | "glass"
  | "green-dark" | "amber-dark" | "red-dark"

// ── Component Props ─────────────────────────────────────────

export interface NetWorthTileProps {
  nw: {
    total: string
    calculatedAt: string
    missingNavCount: number
    breakdown: { label: string; value: string }[]
  }
  onRefresh: () => void
  isRefreshing: boolean
}

export interface FireCorpusTileProps {
  fire: FireCorpusView
  showTooltip: boolean
  onTooltipEnter: () => void
  onTooltipLeave: () => void
}

export type SipFilterType = "active" | "closed"

export interface MonthlySipsTileProps {
  sips: MonthlySipsView
  filter: SipFilterType
  onFilterChange: (filter: SipFilterType) => void
  displayItems: SipRowView[]
  displayCount: number
  displayTotal: string
}

export interface SipRowProps {
  sip: SipRowView
}

export interface AssetAllocationTileProps {
  allocation: DashboardView["allocation"]
  isLoading?: boolean
}

export interface DonutArc {
  label: string
  color: string
  dash: number
  gap: number
  offset: number
}

export interface DonutChartProps {
  arcs: DonutArc[]
  centerLabel: string
  centerValue: string
}

export interface GoalCardProps {
  goal: GoalCardView
}

// ── FireCorpusTile sub-component props ──────────────────────

export interface TargetChipsProps {
  fire: FireCorpusView
}

export interface CorpusHeaderProps {
  fire: FireCorpusView
}

export interface FireProgressBarProps {
  progressPercent: number
}

export interface FireStatsGridProps {
  fire: FireCorpusView
  showTooltip: boolean
  onTooltipEnter: () => void
  onTooltipLeave: () => void
}

// ── Hook Return Types ───────────────────────────────────────

export interface UseDonutChartReturn {
  arcs: DonutArc[]
}

export interface UseFireCorpusTileReturn {
  showTooltip: boolean
  onTooltipEnter: () => void
  onTooltipLeave: () => void
}

export interface UseMonthlySipsTileReturn {
  filter: SipFilterType
  setFilter: (filter: SipFilterType) => void
  displayItems: SipRowView[]
  displayCount: number
  displayTotal: string
}
