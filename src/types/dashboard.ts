import type { GoalType } from "./onboarding"

// ── Computed summaries (from engine) ─────────────────────
export interface GoalSummary {
  id: string
  type: GoalType | "custom"
  label: string
  icon: string
  targetCorpus: number
  lumpsumNeeded: number
  sipNeeded: number
  horizonYears: number
  expectedReturns: number
  colorClass: string
}

export interface FireSummary {
  corpusRequired: number
  expenseAtRetirement: number
  lumpsumNeeded: number
  sipNeeded: number
  yearsToFire: number
  model: "finite" | "perpetual"
  expectedReturns: number
}

export interface NetWorthBreakdown {
  mfPortfolio: number
  epf: number
  nps: number
  ppf: number
  gold: number
  silver: number
  emergencyFund: number
  savings: number
  other: number
  total: number
}

export interface DashboardData {
  netWorth: NetWorthBreakdown
  fire: FireSummary | null
  goals: GoalSummary[]
  totalMonthlySip: number
  totalLumpsumNeeded: number
}

// ── View-model types (drive the dashboard UI) ────────────
export interface NetWorthView {
  total: string
  calculatedAt: string
  missingNavCount: number
  breakdown: { label: string; value: string }[]
}

export type FireTargetType = "finite" | "perpetual" | "suggested"

export interface FireCorpusView {
  currentCorpus: string
  targetCorpus: string
  currentAge: number
  targetAge: number
  progressPercent: number
  gap: string
  reqCagr: string
  targetSip: string
  lumpsumNeeded: string
  targetType: FireTargetType
  onTargetChange: (type: FireTargetType) => void
}

export type SipStatus = "processed" | "pending" | "closed"

export interface SipRowView {
  label: string
  sublabel?: string
  sublabelColor?: string
  amount: string
  status: SipStatus
  dotColor: string
  runtime?: string
}

export interface MonthlySipsView {
  totalAmount: string
  sipCount: number
  pendingCount: number
  items: SipRowView[]
  closedTotalAmount: string
  closedCount: number
  closedItems: SipRowView[]
}

export interface AllocationSegment {
  label: string
  percent: number
  color: string
}

export interface AssetAllocationView {
  equityPercent: number
  segments: AllocationSegment[]
}

export type GoalStatus = "on-track" | "monitor" | "behind"

export interface GoalCardView {
  id: string
  icon: string
  name: string
  status: GoalStatus
  targetLabel: string
  currentValue: string
  progressPercent: number
  gap: string
  borderColor: string
  iconBg: string
}

export interface DashboardView {
  netWorth: NetWorthView
  fire: FireCorpusView | null
  sips: MonthlySipsView
  allocation: AssetAllocationView
  goals: GoalCardView[]
}

