import type { GoalType } from "./onboarding"

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
