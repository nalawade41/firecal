/**
 * Tax Harvest Calculator
 * 
 * Main entry point for calculating tax harvest recommendations
 */

import type { 
  TaxHarvestInputs, 
  TaxHarvestResults, 
  Lot,
  Transaction 
} from "@/types/tax-harvest"
import { 
  processTransactionsFIFO, 
  calculateHarvestPlan,
} from "./fifo-engine"

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
 * Parse Generic CSV format: Date, Type, Units, NAV, Amount, [Fund Name]
 */
export function parseGenericCSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split("\n")
  const transactions: Transaction[] = []
  
  if (lines.length === 0) return transactions
  
  // Skip header row
  const startIndex = lines[0].toLowerCase().includes("date") ? 1 : 0
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split(",")
    if (parts.length < 5) continue
    
    try {
      const dateStr = parts[0].trim()
      const typeStr = parts[1].trim().toLowerCase()
      const units = parseFloat(parts[2])
      const nav = parseFloat(parts[3])
      const amount = parseFloat(parts[4])
      const fundName = parts[5]?.trim()
      
      if (!dateStr || isNaN(nav) || isNaN(amount) || isNaN(units)) continue
      
      const date = parseCSVDate(dateStr)
      if (!date) continue
      
      const type = mapTransactionType(typeStr)
      if (!type) continue
      
      transactions.push({
        id: `tx-${i}`,
        date,
        type,
        units: Math.round(units * 10000) / 10000,
        navPerUnit: nav,
        amount,
        fundName,
      })
    } catch {
      continue
    }
  }
  
  return transactions
}

/**
 * Parse SBI Mutual Fund CSV format: FolioNo, Date (MM/DD/YYYY), SchemeName, Type, NAV, Amount
 */
export function parseSBICSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split("\n")
  const transactions: Transaction[] = []
  
  if (lines.length === 0) return transactions
  
  // Skip header row
  const startIndex = 1
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split(",")
    if (parts.length < 6) continue
    
    try {
      // SBI Format: FolioNo, Date, SchemeName, Type, NAV, Amount
      // indices:      0        1     2          3     4    5
      const dateStr = parts[1].trim()
      const fundName = parts[2].trim()
      const typeStr = parts[3].trim().toLowerCase()
      const nav = parseFloat(parts[4])
      const amount = parseFloat(parts[5])
      
      if (!dateStr || isNaN(nav) || isNaN(amount)) continue
      
      // Parse MM/DD/YYYY format (SBI format)
      const date = parseSBIDate(dateStr)
      if (!date) continue
      
      // Calculate units since not provided in SBI format
      const units = nav > 0 ? amount / nav : 0
      
      const type = mapTransactionType(typeStr)
      if (!type) continue
      
      transactions.push({
        id: `tx-${i}`,
        date,
        type,
        units: Math.round(units * 10000) / 10000,
        navPerUnit: nav,
        amount,
        fundName,
      })
    } catch {
      continue
    }
  }
  
  return transactions
}

/**
 * Route to appropriate CSV parser based on AMC
 */
export function parseCSVTransactions(csvText: string, amc: string = "generic"): Transaction[] {
  switch (amc) {
    case "sbi":
      return parseSBICSV(csvText)
    case "generic":
    default:
      return parseGenericCSV(csvText)
  }
}

/**
 * Parse date from generic CSV (handles DD/MM/YYYY or YYYY-MM-DD)
 */
function parseCSVDate(dateStr: string): Date | null {
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map(Number)
    if (parts[0] > 12) {
      // DD/MM/YYYY format
      return new Date(parts[2], parts[1] - 1, parts[0])
    } else {
      // MM/DD/YYYY format
      return new Date(parts[2], parts[0] - 1, parts[1])
    }
  }
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Parse date from SBI format (MM/DD/YYYY)
 */
function parseSBIDate(dateStr: string): Date | null {
  if (!dateStr.includes("/")) {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }
  
  const parts = dateStr.split("/").map(Number)
  // SBI format is MM/DD/YYYY
  const date = new Date(parts[2], parts[0] - 1, parts[1])
  return isNaN(date.getTime()) ? null : date
}

/**
 * Map transaction type strings to Transaction type
 */
function mapTransactionType(typeStr: string): Transaction["type"] | null {
  switch (typeStr) {
    case "buy":
    case "purchase":
      return "buy"
    case "sip":
      return "sip"
    case "sell":
    case "redemption":
      return "sell"
    case "switch-in":
    case "switch in":
      return "switch-in"
    case "switch-out":
    case "switch out":
      return "switch-out"
    case "bonus":
      return "bonus"
    case "dividend-reinvest":
    case "dividend reinvest":
      return "dividend-reinvest"
    default:
      return null
  }
}
