/**
 * Tax Harvest Calculator
 * 
 * Main entry point for calculating tax harvest recommendations.
 * File parsers have been moved to separate AMC-specific files in the parsers/ directory.
 */

import type { 
  TaxHarvestInputs, 
  TaxHarvestResults, 
  Lot,
  Transaction,
  AMC 
} from "@/types/tax-harvest"
import { 
  processTransactionsFIFO, 
  calculateHarvestPlan,
} from "./fifo-engine"
import {
  parseAxisAMCFile,
  parseSBICSV,
  parseGenericCSV,
} from "./parsers"

/**
 * Calculate complete tax harvest results
 */
export function calculateTaxHarvest(inputs: TaxHarvestInputs): TaxHarvestResults {
  const currentDate = new Date()
  
  // Process all transactions to build lots using FIFO
  const allLots = processTransactionsFIFO(
    inputs.transactions,
    inputs.currentNav,
    currentDate,
    inputs.longTermPeriodMonths,
    inputs.exitLoadPeriodMonths,
    inputs.exitLoadPercent
  )
  
  // Separate eligible and ineligible lots
  const eligibleLots: Lot[] = []
  const ineligibleLots: Lot[] = []
  
  for (const lot of allLots) {
    if (lot.remainingUnits <= 0) continue // Skip exhausted lots
    
    if (lot.isLongTerm && lot.gainPerUnit > 0 && !lot.exitLoadApplies) {
      eligibleLots.push(lot)
    } else {
      ineligibleLots.push(lot)
    }
  }
  
  // Calculate harvest plan
  const harvestPlan = calculateHarvestPlan(eligibleLots, inputs)
  
  // Calculate summary statistics
  const totalUnits = allLots.reduce((sum, lot) => sum + lot.remainingUnits, 0)
  const totalCurrentValue = allLots.reduce((sum, lot) => 
    sum + (lot.remainingUnits * lot.currentNav), 0)
  const totalUnrealizedGain = allLots.reduce((sum, lot) => sum + lot.totalUnrealizedGain, 0)
  
  const totalLongTermGain = allLots
    .filter(lot => lot.isLongTerm && lot.remainingUnits > 0)
    .reduce((sum, lot) => sum + lot.totalUnrealizedGain, 0)
  
  const totalShortTermGain = allLots
    .filter(lot => !lot.isLongTerm && lot.remainingUnits > 0)
    .reduce((sum, lot) => sum + lot.totalUnrealizedGain, 0)
  
  // STCG exposure: short term lots with gains
  const stcgExposure = allLots
    .filter(lot => !lot.isLongTerm && lot.remainingUnits > 0 && lot.gainPerUnit > 0)
    .reduce((sum, lot) => sum + lot.totalUnrealizedGain, 0)
  
  // Exit load risk
  const exitLoadRisk = allLots
    .filter(lot => lot.exitLoadApplies && lot.remainingUnits > 0)
    .reduce((sum, lot) => sum + (lot.remainingUnits * lot.currentNav * lot.exitLoadPercent / 100), 0)
  
  return {
    inputs,
    allLots,
    eligibleLots,
    ineligibleLots,
    harvestPlan,
    summary: {
      totalUnits,
      totalCurrentValue,
      totalUnrealizedGain,
      totalLongTermGain,
      totalShortTermGain,
      stcgExposure,
      exitLoadRisk,
    }
  }
}

/**
 * Get current financial year dates in India
 * FY runs from April 1 to March 31
 */
export function getCurrentFinancialYear(): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed, so April is 3
  
  let fyStart: Date
  let fyEnd: Date
  
  if (month >= 3) { // April onwards (month 3+)
    fyStart = new Date(year, 3, 1) // April 1, current year
    fyEnd = new Date(year + 1, 2, 31) // March 31, next year
  } else {
    fyStart = new Date(year - 1, 3, 1) // April 1, previous year
    fyEnd = new Date(year, 2, 31) // March 31, current year
  }
  
  return { start: fyStart, end: fyEnd }
}

/**
 * Parse an uploaded file based on AMC type
 * Delegates to the appropriate AMC-specific parser
 */
export async function parseAMCFile(file: File, amc: AMC): Promise<Transaction[]> {
  switch (amc) {
    case "axis":
      return parseAxisAMCFile(file)
    case "sbi": {
      const csvText = await file.text()
      return parseSBICSV(csvText)
    }
    case "generic":
    default: {
      const csvText = await file.text()
      return parseGenericCSV(csvText)
    }
  }
}
