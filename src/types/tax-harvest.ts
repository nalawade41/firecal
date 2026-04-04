/**
 * Tax Harvesting Types
 * 
 * Indian mutual fund and stock tax harvesting with FIFO lot accounting.
 */

export type TransactionType = "buy" | "sip" | "sell" | "switch-in" | "switch-out" | "bonus" | "dividend-reinvest"

export interface Transaction {
  id: string
  date: Date
  type: TransactionType
  units: number
  navPerUnit: number
  amount: number
  fundName?: string
  notes?: string
}

export interface Lot {
  id: string
  purchaseDate: Date
  originalUnits: number
  remainingUnits: number
  buyNav: number
  currentNav: number
  // Calculated fields
  holdingPeriodDays: number
  isLongTerm: boolean
  gainPerUnit: number
  totalUnrealizedGain: number
  exitLoadPercent: number
  exitLoadApplies: boolean
  // For partial redemption tracking
  isExhausted: boolean
}

export interface Fund {
  name: string
  currentNav: number
  transactions: Transaction[]
  lots: Lot[]
}

export type AMC = "sbi" | "axis" | "generic"

export interface TaxHarvestInputs {
  fundName: string
  amc: AMC
  currentNav: number
  fyStartDate: Date
  fyEndDate: Date
  ltcgExemptionLimit: number
  alreadyRealizedLTCG: number
  alreadyRealizedSTCG: number
  transactions: Transaction[]
  exitLoadPeriodMonths: number
  exitLoadPercent: number
  longTermPeriodMonths: number
}

export interface HarvestableLot {
  lot: Lot
  fullyRedeemable: boolean
  redeemableUnits: number
  redemptionValue: number
  harvestableGain: number
  isPartial: boolean
}

export interface HarvestPlan {
  totalHarvestableGain: number
  remainingHeadroom: number
  lots: HarvestableLot[]
  partialLot: HarvestableLot | null
  totalUnitsToRedeem: number
  totalRedemptionValue: number
  warnings: string[]
}

export interface TaxHarvestResults {
  inputs: TaxHarvestInputs
  allLots: Lot[]
  eligibleLots: Lot[]
  ineligibleLots: Lot[]
  harvestPlan: HarvestPlan | null
  summary: {
    totalUnits: number
    totalCurrentValue: number
    totalUnrealizedGain: number
    totalLongTermGain: number
    totalShortTermGain: number
    stcgExposure: number
    exitLoadRisk: number
  }
}
