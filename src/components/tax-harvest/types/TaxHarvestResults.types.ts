import type { TaxHarvestResults, Lot, HarvestPlan } from "@/types/tax-harvest"

export interface TaxHarvestResultsProps {
  results: TaxHarvestResults
}

export interface SummaryCardsProps {
  totalCurrentValue: number
  totalUnits: number
  totalLongTermGain: number
  eligibleLotsCount: number
  stcgExposure: number
}

export interface WarningsPanelProps {
  warnings: string[]
}

export interface HarvestPlanSectionProps {
  harvestPlan: HarvestPlan
}

export interface AllLotsSectionProps {
  allLots: Lot[]
  exitLoadRisk: number
}

export type SummaryCardColor = "blue" | "green" | "amber" | "red"
